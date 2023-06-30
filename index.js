const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const startupRouter = require("./routes/startupRoute");
const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const allowedOrigins = require("./config/allowedOrigins");
const cors = require("cors");
const corsMiddleware = require("./middlewares/corsMiddleware");
const corsOptions = require("./config/corsOption");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
dbConnect();

//Le swagger ooptions
const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Library API",
			version: "1.0.0",
			description: "A simple Express Library API",
		},
		servers: [
			{
				url: "http://localhost:5000",
			},
		],
	},
	apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(corsMiddleware);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// app.use(cors());
// // Add the additional CORS middleware to the chain
// app.options('*',corsMiddleware);

// app.use(corsMiddleware);




// // CORS middleware
// app.use(function (req, res, next) {
//   const origin = req.headers.origin;
//   const userAgent = req.headers['user-agent'];
//   if (allowedOrigins.indexOf(origin) !== -1 || userAgent.includes('PostmanRuntime')) {
//     res.header('Access-Control-Allow-Origin', origin);
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
//   } else {
//     res.status(403).send('Forbidden');
//   }
// });

// // OPTIONS handler middleware
// app.options('*', function (req, res) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
//   res.sendStatus(204);
// });

//API Routes
// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/startup", startupRouter);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at PORT  ${PORT} `);
});
