function UserCard({ user }) {
  const { name, role, isAvailable } = user;

  const statusColor = isAvailable ? '#10b981' : '#ef4444';
  const statusBgColor = isAvailable ? '#d1fae5' : '#fee2e2';
  const statusTextColor = isAvailable ? '#065f46' : '#7f1d1d';
  const statusText = isAvailable ? 'Available' : 'Not Available';

  return (
    <div style={cardStyle}>
      <div style={avatarStyle}>
        {name.charAt(0)}
      </div>
      <h3 style={nameStyle}>{name}</h3>
      <p style={roleStyle}>{role}</p>

      <div style={{ ...statusBadgeStyle, backgroundColor: statusBgColor }}>
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: statusColor,
            display: 'inline-block',
            marginRight: '8px'
          }}
        ></span>
        <span style={{ color: statusTextColor, fontWeight: 'bold' }}>
          {statusText}
        </span>
      </div>
    </div>
  );
}

const cardStyle = {
  border: '1px solid #e2e8f0',
  padding: '24px',
  borderRadius: '12px',
  width: '280px',
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  backgroundColor: 'white',
  transition: 'all 0.3s ease',
  cursor: 'pointer'
};

const avatarStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: '#3b82f6',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 auto 16px'
};

const nameStyle = {
  margin: '0 0 8px 0',
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#0f172a'
};

const roleStyle = {
  margin: '0 0 16px 0',
  fontSize: '14px',
  color: '#64748b'
};

const statusBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '14px'
};

export default UserCard;
