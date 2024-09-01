-- CreateTable
CREATE TABLE "CV" (
    "id" SERIAL NOT NULL,
    "cv" JSONB,

    CONSTRAINT "CV_pkey" PRIMARY KEY ("id")
);
