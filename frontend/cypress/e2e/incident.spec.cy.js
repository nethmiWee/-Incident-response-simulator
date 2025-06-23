describe('Incident Simulator', () => {
  it('should trigger an emergency successfully', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Trigger Emergency').click();
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Emergency triggered successfully!');
    });
  });
});