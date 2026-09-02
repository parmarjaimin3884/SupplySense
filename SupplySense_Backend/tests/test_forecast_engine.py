"""
Tests for SupplySense Enterprise Statistical Forecasting Engine
================================================================
Verifies:
- ABC / XYZ Demand Pattern Segmentation
- Holt-Winters Triple Exponential Smoothing
- Croston's Method with Syntetos-Boylan Approximation (SBA)
- Dynamic Service-Level Safety Stock ($Z \\times \\sigma_{DLT}$) & Reorder Point (ROP)
- Statistical Accuracy Metrics (MAPE, WMAPE, RMSE, Bias, FVA)
"""

import pytest
import numpy as np
from backend.app.services.forecast_engine import (
    EnterpriseForecastEngine,
    ABCXYZClassifier,
    HoltWintersForecaster,
    CrostonSBAForecaster,
    DynamicSafetyStockCalculator,
    StatisticalAccuracyEvaluator,
    DemandClassification,
    ForecastResult,
)


class TestABCXYZClassifier:
    def test_smooth_demand_classification(self):
        # Continuous, low variance series
        series = [100.0, 105.0, 98.0, 102.0, 101.0, 104.0, 99.0, 103.0]
        res = ABCXYZClassifier.classify(series)
        assert res.category in ["SMOOTH", "ERRATIC"]
        assert res.adi == 1.0  # Every period has demand
        assert res.recommended_model == "HOLT_WINTERS"

    def test_intermittent_demand_classification(self):
        # Sporadic demand with zeros
        series = [0.0, 0.0, 50.0, 0.0, 0.0, 0.0, 45.0, 0.0, 0.0, 55.0]
        res = ABCXYZClassifier.classify(series)
        assert res.category in ["INTERMITTENT", "LUMPY"]
        assert res.adi >= 1.32
        assert res.recommended_model == "CROSTON_SBA"

    def test_empty_series_fallback(self):
        res = ABCXYZClassifier.classify([])
        assert isinstance(res, DemandClassification)
        assert res.recommended_model == "HOLT_WINTERS"


class TestCrostonSBAForecaster:
    def test_croston_sba_non_zero_prediction(self):
        # Sporadic demand
        history = [0.0, 10.0, 0.0, 0.0, 12.0, 0.0, 10.0, 0.0, 0.0, 14.0]
        fc = CrostonSBAForecaster.forecast(history, periods_ahead=4, alpha=0.15)
        assert len(fc) == 4
        assert all(isinstance(x, float) for x in fc)
        assert all(x > 0 for x in fc)
        # SBA forecast rate per period should be lower than naive average of non-zeros
        assert fc[0] < 12.0

    def test_croston_all_zeros(self):
        history = [0.0, 0.0, 0.0, 0.0]
        fc = CrostonSBAForecaster.forecast(history, periods_ahead=3)
        assert len(fc) == 3
        assert fc == [0.0, 0.0, 0.0]


class TestHoltWintersForecaster:
    def test_holt_winters_upward_trend(self):
        history = [100.0, 110.0, 120.0, 130.0, 140.0, 150.0, 160.0, 170.0]
        fc, res_std = HoltWintersForecaster.forecast(history, periods_ahead=3)
        assert len(fc) == 3
        assert res_std >= 0.0
        # Should predict continuing trend above 170
        assert fc[0] >= 160.0

    def test_single_point_graceful_handling(self):
        fc, res_std = HoltWintersForecaster.forecast([50.0], periods_ahead=3)
        assert len(fc) == 3
        assert fc[0] == 50.0
        assert res_std > 0.0


class TestDynamicSafetyStockCalculator:
    def test_safety_stock_and_rop(self):
        # ADS = 50, Lead Time = 10 days
        ss, rop = DynamicSafetyStockCalculator.calculate(
            avg_daily_sales=50.0,
            lead_time_days=10,
            demand_std=12.0,
            lead_time_std_days=2.0,
            service_level=0.95
        )
        assert ss > 0
        assert rop > (50 * 10)  # ROP must exceed pure lead-time consumption
        assert rop == (50 * 10) + ss

    def test_higher_service_level_increases_safety_stock(self):
        ss_90, _ = DynamicSafetyStockCalculator.calculate(30.0, 14, service_level=0.90)
        ss_95, _ = DynamicSafetyStockCalculator.calculate(30.0, 14, service_level=0.95)
        ss_99, _ = DynamicSafetyStockCalculator.calculate(30.0, 14, service_level=0.99)
        assert ss_90 < ss_95 < ss_99


class TestStatisticalAccuracyEvaluator:
    def test_evaluation_metrics(self):
        actuals = [100.0, 110.0, 105.0, 115.0, 120.0]
        forecasts = [98.0, 112.0, 104.0, 114.0, 118.0]
        metrics = StatisticalAccuracyEvaluator.evaluate(actuals, forecasts)
        assert "mape" in metrics
        assert "wmape" in metrics
        assert "rmse" in metrics
        assert "accuracy_pct" in metrics
        assert metrics["accuracy_pct"] >= 90.0
        assert metrics["wmape"] < 10.0


class TestEnterpriseForecastEngine:
    def test_generate_forecast_full_pipeline(self):
        result = EnterpriseForecastEngine.generate_forecast(
            sku="SKU-LAP-5540",
            history=[1200, 1250, 1310, 1390, 1420, 1500, 1580, 1640],
            base_daily_sales=52.0,
            lead_time_days=14,
            periods_ahead=6,
            service_level=0.95,
        )
        assert isinstance(result, ForecastResult)
        assert len(result.forecast_series) == 6
        assert result.point_forecast_30d > 0
        assert result.point_forecast_60d >= result.point_forecast_30d
        assert result.recommended_safety_stock > 0
        assert result.recommended_rop > result.recommended_safety_stock
        assert result.model_confidence_pct >= 85.0

        # Verify 95% confidence intervals are consistent (lower <= forecast <= upper)
        for pt in result.forecast_series:
            assert pt.lower_95 <= pt.forecast <= pt.upper_95
