import gis from 'g-i-s';

const prompt = 'Types of Servers (Web, Database, Mail, Application, File) in Introduction to Servers';

const gisOptions = {
    searchTerm: prompt,
    queryStringAddition: '&tbs=il:cl'
};

console.time('gis-time');
gis(gisOptions, (err, res) => {
    console.timeEnd('gis-time');
    if (err) {
        console.error('GIS Error:', err);
    } else {
        console.log('Results:', res ? res.length : 0);
        if (res && res.length > 0) {
            console.log('First result:', res[0].url);
        }
    }
});
