const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function promoteAdmin() {
  console.log("Starting admin update script...");

  // 1. Fetch old admin
  const oldAdmin = await prisma.user.findUnique({
    where: { email: "sangammainali07@gmail.com" },
  });

  if (!oldAdmin) {
    console.log("❌ Old admin user sangammainali07@gmail.com not found.");
  } else {
    console.log("Found old admin:", oldAdmin.email, "with role:", oldAdmin.role);
  }

  // 2. Fetch new admin
  const newAdmin = await prisma.user.findUnique({
    where: { email: "sangammainali02@gmail.com" },
  });

  if (!newAdmin) {
    console.log("❌ New admin user sangammainali02@gmail.com not found.");
    console.log("Creating new admin user...");
    // Let's create it if it doesn't exist
    const passwordHash = oldAdmin ? oldAdmin.password : null;
    const createdAdmin = await prisma.user.create({
      data: {
        email: "sangammainali02@gmail.com",
        name: "Sangam Mainali",
        role: "ADMIN",
        password: passwordHash,
        emailVerified: new Date(),
      }
    });
    console.log("✅ Created new admin:", createdAdmin);
  } else {
    console.log("Found new admin:", newAdmin.email, "with role:", newAdmin.role);
    
    // Copy password if missing and update role to ADMIN
    const updateData = {
      role: "ADMIN",
    };
    if (!newAdmin.password && oldAdmin && oldAdmin.password) {
      console.log("Copying password hash from old admin to new admin...");
      updateData.password = oldAdmin.password;
    }

    const updatedAdmin = await prisma.user.update({
      where: { email: "sangammainali02@gmail.com" },
      data: updateData,
    });
    console.log("✅ Updated new admin:", updatedAdmin);
  }

  // 3. Demote old admin if it exists
  if (oldAdmin) {
    const demotedOldAdmin = await prisma.user.update({
      where: { email: "sangammainali07@gmail.com" },
      data: { role: "STUDENT" },
    });
    console.log("✅ Demoted old admin to STUDENT:", demotedOldAdmin);
  }

  await prisma.$disconnect();
  console.log("Admin update script finished.");
}

promoteAdmin().catch(console.error);
