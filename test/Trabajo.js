const Trabajo = artifacts.require( './Trabajo.sol' );

// @todo
contract( 'Trabajo', accounts => {
	it( 'Debería crear un trabajo.', async () => {
		const trabajo = await Trabajo.deployed();

    // @todo
		await myStringStore.set( "Hey there!", { from: accounts[0] } );

		// Get myString from public variable getter
		const storedString = await myStringStore.myString.call();

		assert.equal(storedString, "Hey there!", "The string was not stored");
	});
});
