import React from 'react';

export default function About() {
  return (
    <div className="container py-4">
      <h2>About CarbonLock</h2>
      <p className="lead">CarbonLock is a decentralized platform for transparent, secure, and efficient trading of carbon credit futures contracts on the Internet Computer blockchain.</p>
      <div className="row mt-4">
        <div className="col-md-6">
          <h4>Our Mission</h4>
          <p>
            To empower organizations and individuals to offset their carbon footprint by providing a trustworthy, open, and accessible carbon credit marketplace. CarbonLock leverages blockchain technology to ensure transparency, auditability, and real-world impact.
          </p>
        </div>
        <div className="col-md-6">
          <h4>Our Vision</h4>
          <p>
            To accelerate global climate action by making carbon markets accessible, efficient, and verifiable for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
