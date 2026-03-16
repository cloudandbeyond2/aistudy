import gis from 'g-i-s';

const query = 'Jenkins concepts site:wikimedia.org OR site:pixabay.com OR site:pexels.com OR site:unsplash.com';

console.log('Testing query:', query);
gis(query, (err, res) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Results (first 3):', res.slice(0, 3));
    }
});
