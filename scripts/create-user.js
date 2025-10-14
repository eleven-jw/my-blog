async function main() {
  const { default: bcrypt } = await import("bcryptjs")
  const { PrismaClient } = await import("@prisma/client")

  const prisma = new PrismaClient()

  try {
    const email = "alice@example.com"
    const password = "password123"
    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: "Alice",
        password: hashed,
      },
    })

    console.log("user created:", user)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
