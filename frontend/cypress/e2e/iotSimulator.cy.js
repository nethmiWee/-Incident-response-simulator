describe('IoT Simulator Start/Stop and Traffic Classification', () => {
  beforeEach(() => {
    // Visit the application before each test
    cy.visit('http://localhost:5173');
  });

  it('should detect at least one traffic classification from console logs', () => {
    // Spy on console.log
    cy.window().then((win) => {
      cy.spy(win.console, 'log').as('consoleLogSpy');
    });

    // Click to start the simulator
    cy.contains('Start IoT Simulator').click();

    // Wait for classification logs (adjust based on your simulator speed)
    cy.wait(15000);

    // Verify that the console has logged at least one classification
    cy.get('@consoleLogSpy').should((consoleLog) => {
      const calls = consoleLog.getCalls();

      const found = calls.some(call =>
        call.args.some(arg =>
          arg.includes('Normal traffic detected') ||
          arg.includes('Emergency Detected! Triggering alerts')
        )
      );

      expect(found, 'Should detect at least one traffic classification in console logs').to.be.true;
    });

    // Stop the simulator
    cy.contains('Stop IoT Simulator').click();
  });
});
