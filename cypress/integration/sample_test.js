describe('The App', function () {
  it('should start and display a page', function () {
    cy.visit('/');
    cy.contains('Total')
  })
})