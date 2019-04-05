describe('The App', function() {
    it('should start and display a page', function() {
        cy.visit('http://localhost:8080/'
        )
      cy.contains('Total')
    })
  })