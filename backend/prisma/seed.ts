import { PrismaClient, type ApplicationStage, type JobStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const jobs = [
    { title: "Frontend Developer", location: "Hyderabad", status: "OPEN" as JobStatus },
    { title: "Backend Developer", location: "Bengaluru", status: "OPEN" as JobStatus },
    { title: "Data Analyst", location: "Remote", status: "CLOSED" as JobStatus },
  ];

  const jobRecords = await Promise.all(jobs.map((job) => prisma.job.upsert({
    where: { id: `seed-${job.title.toLowerCase().replaceAll(" ", "-")}` },
    update: { title: job.title, location: job.location, status: job.status },
    create: { id: `seed-${job.title.toLowerCase().replaceAll(" ", "-")}`, ...job },
  })));

  const people: Array<[string, string, string]> = [
    ["Priya Sharma", "priya.sharma@example.com", "9876500001"],
    ["Rahul Verma", "rahul.verma@example.com", "9876500002"],
    ["Ananya Reddy", "ananya.reddy@example.com", "9876500003"],
    ["Arjun Mehta", "arjun.mehta@example.com", "9876500004"],
    ["Sneha Iyer", "sneha.iyer@example.com", "9876500005"],
    ["Karthik Rao", "karthik.rao@example.com", "9876500006"],
    ["Meera Nair", "meera.nair@example.com", "9876500007"],
    ["Vikram Singh", "vikram.singh@example.com", "9876500008"],
    ["Ishita Das", "ishita.das@example.com", "9876500009"],
    ["Aditya Kumar", "aditya.kumar@example.com", "9876500010"],
  ];
  const stages: ApplicationStage[] = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

  for (const [index, [fullName, email, phone]] of people.entries()) {
    const candidate = await prisma.candidate.upsert({
      where: { email }, update: { fullName, phone }, create: { fullName, email, phone },
    });
    const job = jobRecords[index % 3];
    await prisma.application.upsert({
      where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } },
      update: { stage: stages[index % stages.length] },
      create: { candidateId: candidate.id, jobId: job.id, stage: stages[index % stages.length] },
    });
    if (index < 3) {
      await prisma.application.upsert({
        where: { candidateId_jobId: { candidateId: candidate.id, jobId: jobRecords[(index + 1) % 2].id } },
        update: {},
        create: { candidateId: candidate.id, jobId: jobRecords[(index + 1) % 2].id, stage: "APPLIED" },
      });
    }
  }
  console.info("Seed completed: 3 jobs and 10 candidates with applications.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
