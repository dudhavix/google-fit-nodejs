require("dotenv").config();
require("./config/auth");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const { getSteps, getSleep, getHeartRate, mapperData } = require("./services");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

function isLoggedIn(req, res, next) { req.user ? next() : res.redirect("/oauth"); }

app.use(session({ secret: process.env.SEGREDO_SESSION, name: 'sessionId', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/oauth', passport.authenticate('google', { scope: process.env.SCOPES }));
app.get("/oauth2callback", passport.authenticate('google', { successRedirect: '/home', failureRedirect: '/oauth/failure' }));
app.get("/oauth/failure", (req, res) => res.send("Falha ao logar"));

app.get("/", isLoggedIn, (req, res) => res.send({user: req.user}));

app.get("/logout", (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect("/");
});

app.get("/home", isLoggedIn, (req, res) => {
    res.send(`
        <html>

            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
                    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
                <title>Document</title>
            </head>

            <body>
                <div class="card text-center" style="width: 18rem;">
                    <img src="${req.user.profile.picture}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${req.user.profile.displayName}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${req.user.profile.email}</h6>
                        <a href="/steps" class="card-link">Steps</a>
                        <a href="/sleep" class="card-link">Sleep</a>
                        <a href="/heartRate" class="card-link">Heart Rate</a>
                        <a href="/logout" class="card-link">Sair</a>
                    </div>
                </div>
            </body>

        </html>
    `)
});

app.get("/steps", isLoggedIn, async (req, res) => {
    const stepsData = await getSteps(req.user.accessToken);
    const steps = mapperData(stepsData);
    res.send(steps);
});

app.get("/sleep", isLoggedIn, async (req, res) => {
    const sleepData = await getSleep(req.user.accessToken);
    const sleep = mapperData(sleepData);
    res.send(sleep);
});

app.get("/heartRate", isLoggedIn, async (req, res) => {
    const heartRateData = await getHeartRate(req.user.accessToken);
    const heartRate = mapperData(heartRateData);
    res.send(heartRate);
});

app.listen(process.env.PORT, () => console.log(`Rodando na porta ${process.env.PORT}`));