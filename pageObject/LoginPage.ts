import { expect, Page, Locator, } from '@playwright/test';


class LoginPage{
    public page:Page;
    public email:Locator;
    public password:Locator;
    public signInButton:Locator;
    // public dashboardText:Locator;

    constructor(page:Page){
        this.page = page;
        this.email = this.page.locator("#email");
        this.password = this.page.locator("#password");
        this.signInButton = this.page.locator("button[type='submit']");
    }

 async goTo() {
    try {
        await this.page.goto(process.env.BASEURL!);
    } catch (error) {
        console.error(`Failed to navigate to ${process.env.BASEURL}: ${error}`);
        throw error;
    }
}

    async login(email:string, pwd:string){
        await this.email.fill(email);
        await this.password.fill(pwd)
    }

    async clickSignin(){
        await this.signInButton.click();
    }

    async assertLoggedInSuccessfully() {
        await expect(this.page).toHaveTitle("Accept Payments Easy and Fast, Anytime - Airgate");
        // await expect(this.page).toHaveURL("https://uat.airgate.ng/dashboard/overview");
    }
}



export default LoginPage;