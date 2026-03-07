require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Adjust to match frontend URL in production
        methods: ['GET', 'POST'],
    },
});

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Connect Dating App API',
            version: '1.0.0',
            description: 'API Documentation for the Connect dating application',
        },
        servers: [
            {
                url: 'https://datekaroserver.onrender.com',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io Implementation
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room for a specific user to receive events
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    socket.on('sendMessage', (data) => {
        // data expects: { senderId, receiverId, message }
        io.to(data.receiverId).emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
