describe('Web app', () => {
    it('Successfully loads.', () => {
        cy.visit('/')
    })

    it("Log in and execute query on private data", () => {
        cy.visit('/')
        cy.get('input[name="idp"]').clear().type('http://localhost:8080')
        cy.contains('Login').click()

        cy.get('input#email').type('hello@example.com');
        cy.get('input#password').type('abc123');
        cy.contains('button', 'Log in').click();
        cy.contains('button', 'Authorize').click();

        cy.contains('Logged in as:')

        cy.contains('A list of my favorite books').click()  
        cy.contains('"It Ends With Us"')      
    })
})