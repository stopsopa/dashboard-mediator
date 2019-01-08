
module.exports = {
    now: () => (new Date()).toISOString().substring(0, 19).replace('T', ' ')
};