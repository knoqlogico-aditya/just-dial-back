export default class BusinessController{
    showHome(req, res){
        res.render('home');
        
        
        
    }
    showBusiness(req, res){
        const {location, business} = req.body;
        console.log(location, business)

        res.render('business', {location, business});

    }
    
}