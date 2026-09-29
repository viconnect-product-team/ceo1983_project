const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    sub: 'e3e8368d-e3f8-448a-a62d-c8baa50a692e',
    username: 'admin',
    role: 'admin',
    roles: ['admin', 'platform_admin'],
  },
  'super-secret-jwt-key',
  { expiresIn: '1h' }
);

async function testCreatePoll() {
  console.log('Testing POST /api/voting/polls...');
  const res = await fetch('http://localhost:4000/api/voting/polls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Biểu quyết thử nghiệm cùng 1 ngày',
      description: 'Sự kiện diễn ra trong 1 ngày duy nhất',
      startDate: '2026-10-25',
      endDate: '2026-10-25',
      options: ['Đồng ý', 'Không đồng ý'],
      targetAudience: 'all',
      eventId: 'EV-MUKL4LMT',
    }),
  });

  console.log('HTTP Status:', res.status, res.statusText);
  const data = await res.json();
  console.log('Response body:', data);

  if (data?.id) {
    console.log('Poll created successfully with ID:', data.id);
    // Cleanup
    await fetch(`http://localhost:4000/api/voting/polls/${data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Cleaned up test poll.');
  }
}

testCreatePoll().catch(console.error);
