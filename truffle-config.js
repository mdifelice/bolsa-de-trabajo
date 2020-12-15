module.exports = {
  networks: {
    develop: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*',
    },
    rinkeby: { 
      provider: function() {
        const HDWalletProvider = require( '@truffle/hdwallet-provider' ),
              fs               = require( 'fs' ),
              infura           = JSON.parse( fs.readFileSync( __dirname + '/.infura.json' ) );

        return infura ? new HDWalletProvider( infura.mnemonic, 'https://rinkeby.infura.io/v3/' + encodeURIComponent( infura.key ) ) : null;
      },
      network_id: 4,
    }
  },

  compilers: {
    solc: {
      version: '0.7.5',
    }
  }
};
