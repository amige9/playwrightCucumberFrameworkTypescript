Feature: Merchant Login

    @Regression
    Scenario: Merchant Login
        Given the sponsor navigates to the login page
        When the sponsor enters a valid username as "jamiere.kierre@farmoaks.com" and valid password as "BoBolets9%"
        And the sponsor clicks on the sign in button
        Then the sponsor should be logged in
        # yayeno5609@togito.com

    @fail
    Scenario: Merchant Invalid Login
        Given the sponsor navigates to the login page
        When the sponsor enters a valid username as "yayeno5609@togito.com" and valid password as "BoBolets"
        And the sponsor clicks on the sign in button
        Then the sponsor should be logged in
