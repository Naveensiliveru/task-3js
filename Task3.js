class EmailService{

     constructor (providers , maxRetries =3 ,rateLimit=5){
 this.providers = providers;
  this.currentProviderIndex= 0;
  this.maxRetries= maxRetries;
  this.rateLimit= rateLimit;
  this.lastEmailTime =0;
  this.sentEmail=new Set();
  this.statusTracker = new Map();
         
     }
      

      async sendEmail( emailId, emailContent){
        if(this.sentEmail.has(emailId)){
            return{status:"duplicate", details: "Email already sent"};

        }
        if (this._isRateLimited()) {
            return { status: "rate_limited", details: "Rate limit exceeded" };
          }
          this.sentEmail.add(emailId);

          for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            const provider = this.providers[this.currentProviderIndex];
      
      
      }
      try{



        try {
            const result = await provider(emailContent);
            this._logStatus(emailId, "success", result);
            this.lastEmailTime = Date.now();
            return { status: "success", details: result };
          } catch (error) {
            this._logStatus(emailId, "failure", error.message);
    
            if (attempt < this.maxRetries) {
              await this._backoff(attempt);
            } else if (this.currentProviderIndex < this.providers.length - 1) {
              this.currentProviderIndex++;
              attempt = 0; // Reset attempts for the new provider
            } else {
              return { status: "failure", details: "All providers failed" };
            }
          }
        }
    }
        _isRateLimited(){
            const now = Date.now();
            return now - this.lastEmailTime < 1000 / this.rateLimit;
          }


          _logStatus(emailId, Status, details) {
            if (!this.statusTracker.has(emailId)) {
              this.statusTracker.set(emailId, []);
            }
            this.statusTracker.get(emailId).push({ timestamp: Date.now(), Status, details });
          }
          _backoff(attempt) {
            const delay = Math.pow(2, attempt) * 100; // Exponential backoff (e.g., 100ms, 200ms, 400ms)
            return new Promise((resolve) => setTimeout(resolve, delay));
          }
          getEmailStatus(emailId) {
            return this.statusTracker.get(emailId) || [];
          }
        }

        const provider1 = async (emailContent) => {
            if (Math.random() < 0.7) throw new Error("Provider 1 failed");
            return "Provider 1 success";
          };
         
          const provider2 = async (emailContent) => {
            if (Math.random() < 0.5) throw new Error("Provider 2 failed");
            return "Provider 2 success";
          };
          const emailService = new EmailService([provider1, provider2]);
          emailService
          .sendEmail("email-123", { subject: "Hello", body: "World" })
          .then((result) => console.log(result))
          .catch((error) => console.error(error)); 
        
    
        }
    }