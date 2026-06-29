const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

app.use(
  cors({
    origin: "https://hotel-app-mu-two.vercel.app"
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hotel API is working!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.get("/rooms", async (req, res) => {
  const rooms = await prisma.room.findMany({
    orderBy: {
      number: "asc"
    }
  });

  res.json(rooms);
});

app.post("/rooms", async (req, res) => {
  const room = await prisma.room.create({
    data: {
      number: req.body.number,
      status: "empty"
    }
  });

  res.json(room);
});

app.put(
  "/rooms/:id",
  authenticate,
  ownerOnly,
  async (req, res) => {
    const room = await prisma.room.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        status: req.body.status
      }
    });

    res.json(room);
  }
);

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!user || user.password !== password) {
    return res.status(401).json({
      message: "Invalid credentials"
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    "moj_super_tajny_klucz"
  );

  res.json({
    token,
    role: user.role
  });
});

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      "moj_super_tajny_klucz"
    );

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
}

function ownerOnly(req, res, next) {
  if (req.user.role !== "owner") {
    return res.status(403).json({
      message: "Insufficient permissions"
    });
  }

  next();
}
