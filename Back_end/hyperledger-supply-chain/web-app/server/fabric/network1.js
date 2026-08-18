// 'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const IDENTITY = 'manager';
const CHANNEL = 'mychannel';
const CONTRACT = 'basic';

exports.connectToNetwork = async function (req, res, next) {
    try {
        const ccpPath = path.resolve(
            __dirname,
            '..',
            '..',
            '..',
            'network',
            'fabric-network',
            'organizations',
            'peerOrganizations',
            'org1.example.com',
            'connection-org1.json'
        );

        const ccp = JSON.parse(
            fs.readFileSync(ccpPath, 'utf8')
        );

        const walletPath = path.join(
            process.cwd(),
            'wallet'
        );

        console.log(`Wallet path: ${walletPath}`);

        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get(IDENTITY);

        if (!identity) {
            return res.status(503).json({
                status: 'disconnected',
                backend: 'online',
                blockchain: 'unreachable',
                channel: CHANNEL,
                chaincode: CONTRACT,
                identity: IDENTITY,
                error: `Identity "${IDENTITY}" does not exist in wallet`
            });
        }

        const gateway = new Gateway();

        await gateway.connect(ccp, {
            wallet,
            identity: IDENTITY,
            discovery: {
                enabled: true,
                asLocalhost: true
            }
        });

        const network = await gateway.getNetwork(CHANNEL);
        const contract = network.getContract(CONTRACT);

        req.contract = contract;

        next();

    } catch (error) {
        console.error(`Failed to connect to Fabric: ${error}`);

        return res.status(503).json({
            status: 'disconnected',
            backend: 'online',
            blockchain: 'unreachable',
            channel: CHANNEL,
            chaincode: CONTRACT,
            identity: IDENTITY,
            error: error.message
        });
    }
};
