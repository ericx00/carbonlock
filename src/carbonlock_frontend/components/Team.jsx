import React from 'react';

const team = [
  { 
    name: 'Ericx00.', 
    role: 'Founder & Lead Developer', 
    bio: 'Blockchain engineer and climate advocate.', 
    img: '/ericx00.jpg' 
  },
  { 
    name: 'Nessy', 
    role: 'Smart Contract Engineer', 
    bio: 'Rust & IC specialist.', 
    img: 'https://randomuser.me/api/portraits/women/2.jpg' 
  },
  { 
    name: 'Michael Agoya', 
    role: 'Frontend Lead', 
    bio: 'React/Vite UI architect.', 
    img: '/Agoya.jpg' 
  },
  { 
    name: 'Wiltord', 
    role: 'AI/Oracle Dev', 
    bio: 'AI integration and data science.', 
    img: '/wiltord.jpg' 
  }
];

export default function Team() {
  return (
    <div className="container py-4">
      <h2>Meet the Team</h2>
      <div className="row mt-4">
        {team.map((member, idx) => (
          <div className="col-md-3 col-6 mb-4 text-center" key={idx}>
            <img 
              src={member.img} 
              alt={member.name} 
              className="rounded-circle mb-2" 
              width="90" 
              height="90"
            />
            <h5>{member.name}</h5>
            <div className="text-muted">{member.role}</div>
            <p className="small mt-2">{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
