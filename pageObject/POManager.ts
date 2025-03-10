import { Page } from '@playwright/test';
import LoginPage from '../pageObject/LoginPage'

class POManager{
    public page:Page;
    public loginPage: LoginPage
    // public logger;

    constructor(page:Page){
        this.page = page
        this.loginPage = new LoginPage(this.page)
    }


    getLoginPage(){
        return this.loginPage;
    }
}


export default POManager;