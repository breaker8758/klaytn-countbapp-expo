const fs = require('fs')

export default ({ config }) => {
    return {
        ...config,
        extra: {
            DEPLOYED_ADDRESS: fs.existsSync('deployedAddress') && fs.readFileSync('deployedAddress', 'utf8'),
            DEPLOYED_ABI: fs.existsSync('deployedABI') && fs.readFileSync('deployedABI', 'utf8')
        }
    };
};