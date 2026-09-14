import https from 'https';

const urls = [
  'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1582650073289-53b52a1fe182?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1508804185872-d7bad800f13e?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1539667468225-eebb663053e6?auto=format&fit=crop&q=80&w=400&h=300',
];

urls.forEach((url, index) => {
  https.get(url, (res) => {
    console.log(`URL ${index + 1}: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(`URL ${index + 1}: ${e.message}`);
  });
});
