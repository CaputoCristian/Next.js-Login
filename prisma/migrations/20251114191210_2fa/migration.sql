-- CreateTable
CREATE TABLE "user_database"."User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(64) NOT NULL,
    "password" VARCHAR(64) NOT NULL,
    "tfa_secret" VARCHAR(64) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_database"."Token" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "creation_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user_database"."User"("email");

-- AddForeignKey
ALTER TABLE "user_database"."Token" ADD CONSTRAINT "Token_id_fkey" FOREIGN KEY ("id") REFERENCES "user_database"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
