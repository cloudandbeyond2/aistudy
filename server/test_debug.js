console.log('Node environment is working');
try {
    import('express').then(() => console.log('express import works'));
} catch (e) {
    console.error(e);
}
