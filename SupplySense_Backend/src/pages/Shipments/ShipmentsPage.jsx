import React, { useState, useEffect } from 'react';
import { mockApiService } from '../../services/mockApi';
import { Table } from '../../components/ui/Table/Table';
import { StatusChip } from '../../components/ui/StatusChip/StatusChip';
import { SearchBox } from '../../components/ui/SearchBox/SearchBox';
import { Timeline } from '../../components/ui/Timeline/Timeline';
import { Loader } from '../../components/ui/Loader/Loader';
import { FiTruck, FiMapPin, FiClock, FiAlertTriangle, FiCheckCircle, FiNavigation, FiAnchor } from 'react-icons/fi';

export const ShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);

  const fetchShipments = async () => {
    setLoading(true);
    const res = await mockApiService.getShipments();
    setShipments(res.data);
    if (res.data.length > 0) setSelectedShipment(res.data[0]);
    setLoading(false);
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const filteredShipments = shipments.filter(
    (sh) =>
      sh.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      sh.origin.toLowerCase().includes(search.toLowerCase()) ||
      sh.destination.toLowerCase().includes(search.toLowerCase()) ||
      sh.carrier.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { header: 'Tracking #', accessor: 'trackingNumber', render: (val) => <span className="table-code">{val}</span> },
    { header: 'Carrier', accessor: 'carrier' },
    { header: 'Route', accessor: 'origin', render: (val, row) => `${val} ➔ ${row.destination}` },
    { header: 'Departure', accessor: 'departureDate' },
    { header: 'Estimated Delivery', accessor: 'estimatedDelivery' },
    { header: 'Status', accessor: 'status', render: (val) => <StatusChip status={val} /> },
    { header: 'Delay Notice', accessor: 'delayReason', render: (val) => val ? <span className="delay-alert"><FiAlertTriangle size={12} /> {val}</span> : <span className="on-time"><FiCheckCircle size={12} /> On Schedule</span> }
  ];

  const timelineEvents = selectedShipment
    ? [
        { title: 'Origin Customs Departure', time: selectedShipment.departureDate, status: 'completed', description: `Cleared at ${selectedShipment.origin}` },
        { title: 'In-Transit Sea / Air Freight', time: 'In Progress', status: 'active', description: `Carrier ${selectedShipment.carrier} route telemetry verified.` },
        { title: 'Destination Hub Inspection', time: selectedShipment.estimatedDelivery, status: 'pending', description: `Scheduled at ${selectedShipment.destination}` }
      ]
    : [];

  return (
    <div className="shipments-page">
      {/* Page Title Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">In-Transit Freight & Telematics Tracking</h1>
          <p className="page-subtitle">Live vessel GPS location, port congestion alerts & delay recovery ETA</p>
        </div>
      </div>

      {/* Main Grid: Left Map + Right Active Tracking Cards */}
      <div className="shipment-visual-grid">
        {/* Mock Geographic Map Interface */}
        <div className="map-container-card">
          <div className="map-header">
            <span className="map-title"><FiNavigation size={16} /> Global Live Telematics Radar</span>
            <span className="map-badge">5 Active Transits</span>
          </div>

          <div className="mock-map-canvas">
            <div className="map-route-line" />
            <div className="map-pin origin" style={{ top: '45%', left: '25%' }}>
              <FiAnchor size={14} />
              <span className="pin-label">Shenzhen (SZX)</span>
            </div>
            <div className="map-pin vessel" style={{ top: '40%', left: '55%' }}>
              <FiTruck size={16} className="moving-vessel-icon" />
              <span className="pin-label vessel-active">{selectedShipment?.trackingNumber}</span>
            </div>
            <div className="map-pin destination" style={{ top: '35%', left: '80%' }}>
              <FiMapPin size={14} />
              <span className="pin-label">Oakland, USA</span>
            </div>
          </div>
        </div>

        {/* Timeline & ETA Cards */}
        {selectedShipment && (
          <div className="shipment-timeline-card">
            <div className="st-header">
              <div>
                <span className="st-code">{selectedShipment.trackingNumber}</span>
                <h3>{selectedShipment.carrier} Transit</h3>
              </div>
              <StatusChip status={selectedShipment.status} />
            </div>

            <div className="st-eta-box">
              <FiClock size={20} color="#3B82F6" />
              <div>
                <div className="eta-lbl">Est. Arrival Date</div>
                <div className="eta-val">{selectedShipment.estimatedDelivery}</div>
              </div>
            </div>

            <div className="st-route-info">
              <div>
                <span className="lbl">Origin</span>
                <span className="val">{selectedShipment.origin}</span>
              </div>
              <div className="arrow-sep">➔</div>
              <div>
                <span className="lbl">Destination</span>
                <span className="val">{selectedShipment.destination}</span>
              </div>
            </div>

            <Timeline events={timelineEvents} />
          </div>
        )}
      </div>

      {/* Filter Control Bar */}
      <div className="shipment-controls-bar">
        <SearchBox
          placeholder="Search by Tracking Number, Carrier, Origin..."
          value={search}
          onChange={(val) => setSearch(val)}
        />
      </div>

      {/* Main Table */}
      {loading ? (
        <Loader label="Connecting to ocean & air freight telematics streams..." />
      ) : (
        <div className="table-container-card">
          <Table
            columns={columns}
            data={filteredShipments}
            onRowClick={(row) => setSelectedShipment(row)}
          />
        </div>
      )}
    </div>
  );
};

export default ShipmentsPage;
