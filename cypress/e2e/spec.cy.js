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

    it("Query on private data unauthenticated", () => {
        cy.visit('/')
        
        cy.contains('A list of my favorite books').click()
        cy.contains('Something went wrong while preparing the query.')
    })

    it('Querying resource with "bad" cors header, though a proxy should work', () => {
        cy.visit('/')
        cy.get('input[name="idp"]').clear().type('http://localhost:8080')
        cy.contains('Login').click()

        cy.get('input#email').type('hello@example.com');
        cy.get('input#password').type('abc123');
        cy.contains('button', 'Log in').click();
        cy.contains('button', 'Authorize').click();

        cy.contains('Logged in as:')

        cy.contains('Test query').click()
        cy.get('.gridjs').find('tr')

    })

    it("Query public data", () => {
        cy.visit('/')
        
        cy.contains('My wish list').click()
        cy.contains('"Too Late"')
    })

    it("Query public ASK query", () => {
        cy.visit('/')
        
        cy.contains('Is there an artist influenced by Picasso?').click()
        cy.contains('Finished in:')
        cy.contains('There is an artist who is inspired by Picasso!')
    })

    it("Querying variable ending on _img should return an image as result", () => {
        cy.visit('/')
        
        cy.contains('A Test For Images').click()
        cy.contains('Finished in:')
        cy.get('.gridjs').find('img')
    })
})