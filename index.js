const express = require('express');
const session = require('express-session');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING
    }
});

const VisitorData = sequelize.define('VisitorData', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    howDidYouHear: {
        type: DataTypes.STRING,
        allowNull: false
    },
    whyLearnItalian: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expectations: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, saltRounds);
});

User.prototype.checkPassword = function(password) {
    return bcrypt.compare(password, this.password);
};

sequelize.sync();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', (req, res) => {
    res.send(`
        <h1>Benvenuto alla tua Web App per l'Apprendimento delle Lingue!</h1>
        <p>Questa è la tua sezione Home.</p>
        <ul>
            <li><a href="/video-audio">Video e Audio</a></li>
            <li><a href="/profile">Profilo Utente</a></li>
            <li><a href="/tasks">Compiti</a></li>
        </ul>
        ${req.session.user ? '<a href="/logout">Logout</a>' : '<a href="/login">Login</a> | <a href="/register">Registrati</a>'}
        <h2>Privacy e Trattamento dei Dati</h2>
        <p>La tua privacy è importante per noi. I tuoi dati personali verranno trattati in conformità con la nostra <a href="/privacy-policy">Politica sulla Privacy</a>. Registrandoti, accetti di fornire i tuoi dati e di ricevere comunicazioni da parte nostra.</p>
    `);
});

app.get('/video-audio', isAuthenticated, (req, res) => {
    res.send('<h1>Video e Audio</h1><p>Sezione per video e audio del corso.</p>');
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.send('<h1>Profilo Utente</h1><p>Dettagli sul profilo dell\'utente.</p>');
});

app.get('/tasks', isAuthenticated, (req, res) => {
    res.send('<h1>Compiti</h1><p>Sezione per la gestione dei compiti.</p>');
});

app.get('/privacy-policy', (req, res) => {
    res.send(`
        <h1>Politica sulla Privacy</h1>
        <p>La tua privacy è importante per noi. Questa politica descrive come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali.</p>
        <h2>Raccolta dei Dati</h2>
        <p>Raccogliamo dati personali come nome, email, numero di telefono e altre informazioni fornite durante la registrazione.</p>
        <h2>Utilizzo dei Dati</h2>
        <p>I tuoi dati vengono utilizzati per fornirti servizi e migliorare la tua esperienza. Potremmo utilizzare i tuoi dati per scopi di marketing solo con il tuo consenso.</p>
        <h2>Protezione dei Dati</h2>
        <p>Adottiamo misure di sicurezza per proteggere i tuoi dati personali da accessi non autorizzati.</p>
        <h2>Diritti dell'Utente</h2>
        <p>Hai il diritto di accedere, correggere o cancellare i tuoi dati personali. Per qualsiasi richiesta, contattaci.</p>
        <a href="/">Torna alla Home</a>
    `);
});

app.get('/register', (req, res) => {
    res.send(`
        <h1>Registrati</h1>
        <form action="/register" method="post">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required><br>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required><br>
            <label for="userType">Tipo di Utente:</label>
            <select id="userType" name="userType" required>
                <option value="client">Cliente</option>
                <option value="visitor">Visitante</option>
            </select><br>
            <div id="additional-info" style="display: none;">
                <label for="code">Codice Cliente:</label>
                <input type="text" id="code" name="code"><br>
                <div id="visitor-info" style="display: none;">
                    <h2>Informazioni Visitante</h2>
                    <label for="firstName">Nome:</label>
                    <input type="text" id="firstName" name="firstName" required><br>
                    <label for="lastName">Cognome:</label>
                    <input type="text" id="lastName" name="lastName" required><br>
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required><br>
                    <label for="phoneNumber">Numero di Telefono:</label>
                    <input type="text" id="phoneNumber" name="phoneNumber" required><br>
                    <label for="howDidYouHear">Come hai conosciuto l'app:</label>
                    <input type="text" id="howDidYouHear" name="howDidYouHear" required><br>
                    <label for="whyLearnItalian">Perché vuoi imparare l'italiano:</label>
                    <input type="text" id="whyLearnItalian" name="whyLearnItalian" required><br>
                    <label for="expectations">Cosa ti aspetti da questa app:</label>
                    <input type="text" id="expectations" name="expectations" required><br>
                </div>
            </div>
            <label for="consent">
                <input type="checkbox" id="consent" name="consent" required>
                Acconsento al trattamento dei miei dati personali come descritto nella <a href="/privacy-policy">Politica sulla Privacy</a>.
            </label><br>
            <button type="submit">Registrati</button>
        </form>
        <script>
            document.getElementById('userType').addEventListener('change', function() {
                var additionalInfo = document.getElementById('additional-info');
                var visitorInfo = document.getElementById('visitor-info');
                if (this.value === 'client') {
                    additionalInfo.style.display = 'block';
                    visitorInfo.style.display = 'none';
                } else if (this.value === 'visitor') {
                    additionalInfo.style.display = 'none';
                    visitorInfo.style.display = 'block';
                } else {
                    additionalInfo.style.display = 'none';
                    visitorInfo.style.display = 'none';
                }
            });
        </script>
    `);
});

app.post('/register', async (req, res) => {
    const { username, password, userType, code, firstName, lastName, email, phoneNumber, howDidYouHear, whyLearnItalian, expectations, consent } = req.body;

    if (!consent) {
        return res.send('<h1>Registrazione Fallita</h1><p>È necessario acconsentire al trattamento dei dati personali.</p>');
    }

    try {
        if (userType === 'client') {
            await User.create({ username, password, userType, code });
            req.session.user = username;
            res.redirect('/');
        } else if (userType === 'visitor') {
            await User.create({ username, password, userType });
            await VisitorData.create({ username, firstName, lastName, email, phoneNumber, howDidYouHear, whyLearnItalian, expectations });
            req.session.user = username;
            res.redirect('/');
        }
    } catch (error) {
        res.status(500).send('<h1>Registrazione Fallita</h1><p>Si è verificato un errore durante la registrazione. Assicurati che il nome utente non sia già in uso e riprova.</p>');
    }
});

app.get('/login', (req, res) => {
    res.send(`
        <h1>Login</h1>
        <form action="/login" method="post">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required><br>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required><br>
            <button type="submit">Login</button>
        </form>
    `);
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (user && await user.checkPassword(password)) {
        req.session.user = username;
        res.redirect('/');
    } else {
        res.status(401).send('<h1>Login Fallito</h1><p>Username o password non corretti. Riprova.</p>');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/export-emails', async (req, res) => {
    try {
        const visitors = await VisitorData.findAll({ attributes: ['email'] });
        const emails = visitors.map(visitor => visitor.email);
        res.json(emails);
    } catch (error) {
        res.status(500).send('Errore durante l\'estrazione delle email.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
