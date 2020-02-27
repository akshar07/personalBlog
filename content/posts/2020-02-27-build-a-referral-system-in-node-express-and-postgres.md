---
template: post
title: Build a Referral System in Node-Express and Postgres
slug: Build a Referral System in Node-Express and Postgres
draft: false
date: 2020-02-27T01:33:05.279Z
description: >-
  Word of mouth is the one of the most effective marketing strategy today. Every
  day we see many companies using referral programs for targeted promotions and
  marketing. But how are these referral programs built? What is the logic behind
  it? Today we will answer these questions by building a simple but complete
  referral system of our own.
category: 'Engineering '
tags:
  - JavaScript
  - Nodejs
  - Postgres
  - Referral Marketing
---
Word of mouth is the one of the most effective marketing strategy today. Everyday we see many companies using referral programs for targeted promotions and marketing. But how are these referral programs built? What is the logic behind it? Today we will answer these question by building a simple but complete referral system of our own.

But lets have a look at the app first! There you go buddy : Hit that- <https://invitation-system.herokuapp.com/>

You can see the repository here: <https://github.com/akshar07/invitation-system>

Cool ! So here is what we are going build:

We will have 2 applications:

* API
* Web Client

Web client will have two views:

* A **dashboard** for authenticated users which has ability to send invitations to an email address with message and list out all invitations and their status (seen or unseen)
* **Recipient view** of Invitation where he is able to see the invitation message and sender info

The API will create an invitation with a sender, recipient and each invitation will be accessible via unique URL.

We are going to build this using the following components:

* Node-Express server
* Postgres Database
* Node emailer for sending emails
* passportJS for social authentication

![](https://miro.medium.com/max/784/1*28ODTcYuHJVlwsqTrZvGeg.png)

**Lets get started !**

### Initialize a new project :

```
npm init --y
```

In package.json add the following dependencies:

```
{
  "name": "invitation",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "dependencies": {
    "axios": "^0.17.1",
    "body-parser": "^1.18.2",
    "cookie-session": "^2.0.0-beta.3",
    "ejs": "^2.5.7",
    "express": "^4.16.2",
    "express-enforces-ssl": "^1.1.0",
    "express-session": "^1.15.6",
    "fs": "0.0.1-security",
    "lodash": "^4.17.5",
    "nodemailer": "^4.6.3",
    "nodemon": "^1.14.12",
    "passport": "^0.4.0",
    "passport-facebook": "^2.1.1",
    "pg": "^7.4.1",
    "shortid": "^2.2.8"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node ./server/server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "prettier": "1.11.1",
    "prettier-eslint": "^8.8.1"
  }
}
```

```
npm install
```

Once installed, we will start working on our backend.

**Setting up Postgres:**

![](https://miro.medium.com/max/60/1*ry4fLo9dW_KN_teivGIMdw.jpeg?q=20)

![](https://miro.medium.com/max/8320/1*ry4fLo9dW_KN_teivGIMdw.jpeg)

```
const { Client } = require("pg");
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
//connection query and creation of tables
client.connect();
const db_creation_string = `CREATE TABLE IF NOT EXISTS invitations(id SERIAL PRIMARY KEY, created_at TIMESTAMP, 
                            updated_at TIMESTAMP, link TEXT, senderId TEXT, sendermsg TEXT, senderName TEXT, 
                            receiverId TEXT);
                        CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, name TEXT, link TEXT, email TEXT);`;
```

We will have two tables — one for storing the authenticated **users** and the required information and other for storing all the **invitations** the user has sent. We will also maintain a timestamp to let the sender know if their invitation was viewed.

**Facebook Authentication:**

I assume that you have facebook developer account and an application set up. If not, there are *tons* of resources on how to setup fb app for development. That said, lets look how we handle the user sig up /sign in with passport JS facebook strategy.

```
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
// Deserialize user from the sessions
passport.deserializeUser((user, done) => done(null, user));
//passport middleware
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL:
        "https://invitation-system.herokuapp.com/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"],
      enableProof: true
    },
    function(accessToken, refreshToken, profile, done) {
      //we get the above 4 things from facebook
      //first we will check if the user is in our database. If not we will add the user and give done callback.
      let pro_email = profile.emails[0].value;
      client.query(
        `SELECT * FROM users WHERE email='${pro_email}'`,
        (err, doc) => {
          if (err) {
            console.log(err); 
          }
          if (doc.rows.length >= 1) { 
            console.log("ran");
            done(null, doc);
          } else {
            console.log("yep");
            let shortId = shortid.generate();
            while(shortId.indexOf('-')>=0){
              shortId = shortid.generate();
            }
            client.query(
              `INSERT INTO users (name, link, email) VALUES ('${
                profile.displayName
              }','${shortId}','${pro_email}')`,
              (err, doc) => {
                if (err) {
                  console.log(err); 
                } else {
                  done(null, {rows:[{name:profile.displayName,link:shortId,email:pro_email}]}); 
                }
              }
            );
          }
        }
      );
    }
  )
);
//facebook call back url
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/home",
    failureRedirect: "/auth/facebook",
  })
);

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: "email" })
);
```

We are doing some of important things here:

1. Once we get back the data from facebook, we first check if the user is already there in our system.
2. If user is there, simply call the done method so that the user is navigated to the home page
3. If user is not present, add him in our database and call done
4. We are also checking if our generateId function does not generate strings with hyphens as this will cause problems with our further logic.

**Home Page:**

```
//after authentication - home route
app.get("/home", isLoggedIn, (req, res) => {
  res.render("home", {
    name: req.user.rows[0].name,
    link: req.user.rows[0].link,
    email: req.user.rows[0].email
  });
});

//middleware for cheking logged in session
function isLoggedIn(req, res, next) {
  console.log(req.isAuthenticated());
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();
  // if they aren't redirect them to the home page
  res.redirect("/");
}
```

Home view:

We will keep user dashboard very simple:

```
 <div class="container">
    <div class="jumbotron text-center">
      <div style="float:right;"><a href="/logout" class="btn btn-default btn-sm">Logout</a></div>
      <h3> Welcome
          <span id="name"><%= name %></span>
      </h3>
      <p id="currentUser"><%= email %></p>
      <p>Your Invitation Code is:
          <span id="link"><%= link %></span>
      </p>
      <hr>
      <input type="email" placeholder="email" id="invite_mail">
      <label for="message"></label>
      <input id="message" placeholder="Your message"></input>
      <button onclick="invite()"> Invite</button>
      <br />
      <button onclick="myInvitations()" style="margin-top:20px;"> My Invites</button>
      <br />
      <ul id="myInvites" style="list-style:none;"></ul>
    </div>
  </div>
```

Ok so let's add the invite functionality to our app. We will let users enter any email id to send the invite to and also attach a message with it. Our Invite function will be as follows:

```
 //function to send invite
        function invite() {
            let sender = document.getElementById('currentUser').innerHTML;
            let link = document.getElementById('link').innerHTML;
            let inviteTo = document.getElementById('invite_mail').value;
            let message = document.getElementById('message').value;
            let name = document.getElementById('name').innerHTML;
            fetch('/invite', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: sender,
                    link: link,
                    to: inviteTo,
                    msg: message,
                    name: name
                })
            }).then(res => console.log(res))
        }
```

Here we just collect all the data and post it to our server where we will be actually adding invitation to our database and sending an email to the desired person.

```
//invite route
app.post("/invite", (req, res) => {
  let senderId = req.body.link,
    sendermsg = req.body.msg,
    receiverId = req.body.to,
    newLink = shortid.generate();
    senderName = req.body.name;
  let current = new Date().toISOString()
  client.query(
    `INSERT INTO invitations (created_at,updated_at, link, senderId,sendermsg,senderName,receiverId) VALUES ('${current}','${current}','${newLink}','${senderId}','${sendermsg}','${senderName}','${receiverId}')`,
    (err, result) => {
      if (err) {
        return console.log(err);
      } else {
        sendEmail(receiverId, senderId, newLink);
        res.send("invited");
      }
    }
  );
});
```

We extract the request data first and insert it into our database. We then send email to the entered email address using sendEmail function which we will explore shortly. We will also update created_at value for this invitation with current time.

```
//send email function
function sendEmail(_to, _from, _link) {
  console.log(process.env.password)
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.password
    }
  });
  let clientUrl = `https://invitation-system.herokuapp.com/invite/${_from}-${_link}`;
  var mailOptions = {
    from: "akshartakle.aiesec@gmail.com",
    to: _to,
    subject: "You have been Invited to Awesome App",
    html: `<p> Your invitation link is: <a href='${clientUrl}'> ${clientUrl}</a>`
  };
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
```

Here we are using nodemailer a npm module for sending out emails. Add your gmail’s email and password as environment variables in your server for safety. We will format the invitation string with our invitation code and the recipient invitation code so that its easy for us to fetch the particular invitation from the database later when user clicks on the link.

```
let clientUrl = `https://invitation-system.herokuapp.com/invite/${_from}-${_link}`;
```

**Note: change your gmail account settings to allow less secure apps so that nodemailer can send mails on behalf of you.**

Now in our home view, we had an empty list to show all the users invitation and their status. Lets populate this list:

```
        // function to get all the invitations
        function myInvitations() {
            if(document.getElementById('myInvites').children.length===0){
                let link = document.getElementById('link').innerHTML;
                fetch(`/myInvitations?link=${link}`).then(res => res.json()).then(invites => {
                    invites.forEach(invite => {
                        addToList(invite.receiverid, invite.created_at, invite.updated_at)
                    });
                })
            }
        }
        function addToList(_to, _sent, _seen) {
            let isSeen="not seen";
            if(new Date(_seen) - new Date(_sent)>0){isSeen="Seen"}
            let sent = new Date(_sent).toLocaleDateString();
            let node = document.createElement("LI"); // Create a <li> node
            let textnode = document.createTextNode(`${_to} - ${sent} - ${isSeen}`); // Create a text node
            node.appendChild(textnode); // Append the text to <li>
            document.getElementById("myInvites").appendChild(node);
        }
```

we simply send our unique invitation code as query parameter to the server to get all our sent invitations. On the server side we query invitations table with the our invitation code and pass back the results.

```
/ user invitations
app.get("/myInvitations", (req, res) => {
  let link=req.query.link
  console.log(link)
  client.query(
    `SELECT * from invitations where senderId='${link}'`,
    (err, doc) => {
      if (err) {
        console.log(err);
      } else {
        console.log(doc);
        res.status(200).send(doc.rows);
      }
    }
  );
});
```

Great ! Now we can see all our invitations and their status with a click. So far going good.

Now we have to create the recipient view. We will have a different route for this. If you remember we formatted the invitation url to get the particular invitation from our database when recipient clicks on it. We will now separate the two invitation codes and query the invitations table to get the exact invitation data.

```
app.get("/invite/:id", (req, res) => {
  console.log(req.params);
  let sender = req.params.id
    .trim()
    .split("-")[0]
    .trim();
  let inviteLink = req.params.id
    .trim()
    .split("-")[1]
    .trim();
  console.log(sender);
  console.log(inviteLink);
  client.query(`SELECT * FROM invitations WHERE senderid='${sender}' AND link='${inviteLink}'`, (err, doc) => {
    if (err) {
      return console.log(err);
    } else {
      let seen=new Date().toISOString();
      client.query(`UPDATE invitations SET updated_at='${seen}' WHERE senderid='${sender}' AND link='${inviteLink}'`,(err,doc)=>{
        if(err){return console.log(err)}
        else{
          console.log("seen updated")
        }
      })
      console.log(doc.rows)
      res.render("invite", { result: doc.rows[0] });
    }
  });
});
```

Here we are also doing one more important thing, that is updating the value of updated_at column in our invitations table with the current timestamp when the recipient has clicked the link. Thus we can see the status of whether the recipient has seen our link or not on our main home dashboard. We then send the data back to our frontend and display the invitation details.

```
<div class="container">
  <div class="jumbotron text-center">
      <h1>Your Have Been Invited!!</h1>
      <p>
          <%=result.sendername%> has invited you to join this wonderful app
      </p>
     <p> <%=result.sendername%> says: <%=result.sendermsg%></p>
  </div>
</div>
```

And we have done it! Be that wolf and send out those invitations on the street…

![Wolf of the wall street](https://media.giphy.com/media/EJMyMO22UxP68/giphy.gif)
