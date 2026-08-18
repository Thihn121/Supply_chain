'use strict';

const fs = require('fs');
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');
const CHANNEL = 'mychannel';
const CONTRACT = 'basic';
const IDENTITY = 'manager';
let gateway = null;
let contract = null;
let connectingPromise = null;
// Connection profile
function getConnectionProfilePath() {
    return path.resolve(
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
}

function getWalletPath() {
    // enrollAdmin.js va registerUsers.js 
    // store identities in server/wallet.
    return path.join(process.cwd(), 'wallet');
}

// Disconnect / reset

async function disconnectFabric() {
    if (gateway) {
        try {
            gateway.disconnect();
        } catch (error) {
            console.error(
                `Error while disconnecting Fabric Gateway: ${error.message}`
            );
        }
    }

    gateway = null;
    contract = null;
    connectingPromise = null;
}

// Connect to Fabric

async function createFabricConnection() {
    // Reuse an existing connection.
    if (gateway && contract) {
        return contract;
    }

    // multiple Gateway connections.
    if (connectingPromise) {
        return connectingPromise;
    }

    connectingPromise = (async () => {
        try {
            const ccpPath = getConnectionProfilePath();

            if (!fs.existsSync(ccpPath)) {
                throw new Error(
                    `Connection profile not found: ${ccpPath}`
                );
            }

            const ccp = JSON.parse(
                fs.readFileSync(ccpPath, 'utf8')
            );

            const walletPath = getWalletPath();

            console.log(`Wallet path: ${walletPath}`);

            const wallet = await Wallets.newFileSystemWallet(
                walletPath
            );

            const identity = await wallet.get(IDENTITY);

            if (!identity) {
                throw new Error(
                    `An identity for the user "${IDENTITY}" does not exist in the wallet`
                );
            }

            const newGateway = new Gateway();

            await newGateway.connect(ccp, {
                wallet,
                identity: IDENTITY,
                discovery: {
                    enabled: true,
                    asLocalhost: true
                }
            });

            const fabricNetwork = await newGateway.getNetwork(
                CHANNEL
            );

            const fabricContract =
                fabricNetwork.getContract(CONTRACT);

            gateway = newGateway;
            contract = fabricContract;

            console.log(
                `Connected to Fabric: channel=${CHANNEL}, contract=${CONTRACT}, identity=${IDENTITY}`
            );

            return contract;

        } catch (error) {
            // Connection is not kept.
            if (gateway) {
                try {
                    gateway.disconnect();
                } catch (_) {
                    // Ignore disconnect errors during cleanup.
                }
            }

            gateway = null;
            contract = null;

            throw error;

        } finally {
            connectingPromise = null;
        }
    })();

    return connectingPromise;
}
// Middleware used by the existing app.js
//
// Existing routes in AleRapchan use:
//     network.connectToNetwork
//
// and then:
//     req.contract
exports.connectToNetwork = async function (req, res, next) {
    try {
        req.contract = await createFabricConnection();

        next();

    } catch (error) {
        console.error(
            `Failed to connect to Fabric: ${error.message}`
        );

        await disconnectFabric();

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

// Utility: get the currently connected contract
exports.getContract = async function () {
    return createFabricConnection();
};
// Utility: force reconnect
exports.resetConnection = async function () {
    await disconnectFabric();
};
// Utility: execute a query with one automatic reconnect
exports.evaluateTransaction = async function (
    transactionName,
    ...args
) {
    try {
        const fabricContract = await createFabricConnection();

        return await fabricContract.evaluateTransaction(
            transactionName,
            ...args
        );

    } catch (firstError) {
        console.error(
            `Fabric query failed (${transactionName}). Retrying after reconnect...`
        );

        await disconnectFabric();

        try {
            const fabricContract = await createFabricConnection();

            return await fabricContract.evaluateTransaction(
                transactionName,
                ...args
            );

        } catch (secondError) {
            console.error(
                `Fabric query retry failed (${transactionName}): ${secondError.message}`
            );

            await disconnectFabric();

            throw secondError;
        }
    }
};

// Utility: submit a transaction with one automatic reconnect
// Existing AleRapchan routes can continue using req.contract.

exports.submitTransaction = async function (
    transactionName,
    ...args
) {
    try {
        const fabricContract = await createFabricConnection();

        return await fabricContract.submitTransaction(
            transactionName,
            ...args
        );

    } catch (firstError) {
        console.error(
            `Fabric transaction failed (${transactionName}). Retrying after reconnect...`
        );

        await disconnectFabric();

        try {
            const fabricContract = await createFabricConnection();

            return await fabricContract.submitTransaction(
                transactionName,
                ...args
            );

        } catch (secondError) {
            console.error(
                `Fabric transaction retry failed (${transactionName}): ${secondError.message}`
            );

            await disconnectFabric();

            throw secondError;
        }
    }
};
// Health check
exports.healthCheck = async function () {
    try {
        await exports.evaluateTransaction(
            'productExists',
            '__health_check_product__'
        );

        return {
            status: 'connected',
            backend: 'online',
            blockchain: 'reachable',
            channel: CHANNEL,
            chaincode: CONTRACT,
            identity: IDENTITY
        };

    } catch (error) {
        await disconnectFabric();

        return {
            status: 'disconnected',
            backend: 'online',
            blockchain: 'unreachable',
            channel: CHANNEL,
            chaincode: CONTRACT,
            identity: IDENTITY,
            error: error.message
        };
    }
};
