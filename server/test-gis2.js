import gis from 'g-i-s';

const opts = {
  searchTerm: 'Jenkins CI/CD concept',
  queryStringAddition: '&tbs=il:cl' // Creative Commons
};

console.log('Testing GIS with CC filter:', opts);
gis(opts, (err, res) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Results (first 3):', res.slice(0, 3));
    }
});
