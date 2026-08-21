-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROFESOR', 'CLIENTE');

-- CreateEnum
CREATE TYPE "RepsUnit" AS ENUM ('REPS', 'SECONDS');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO');

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "login_id" TEXT,
    "password_hash" VARCHAR(255),
    "email" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "deactivated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profesores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "schedule" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profesores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "dni" VARCHAR(20) NOT NULL,
    "member_since" TIMESTAMP(3) NOT NULL,
    "profesor_id" TEXT,
    "routine_id" TEXT,
    "routine_assigned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "catalog_id" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "body_part" VARCHAR(100),
    "equipment" VARCHAR(100),
    "muscle_group" VARCHAR(100),
    "target" VARCHAR(100),
    "secondary_muscles" JSONB,
    "instruction_steps" JSONB,
    "image" VARCHAR(500),
    "gif_url" VARCHAR(500),
    "attribution" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routines" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "profesor_id" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_days" (
    "id" TEXT NOT NULL,
    "routine_id" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,

    CONSTRAINT "routine_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_exercises" (
    "id" TEXT NOT NULL,
    "routine_day_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "unit" "RepsUnit" NOT NULL DEFAULT 'REPS',
    "rest_seconds" INTEGER NOT NULL,
    "comment" VARCHAR(500),

    CONSTRAINT "routine_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "routine_id" TEXT,
    "routine_day_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "weekday" INTEGER NOT NULL,
    "duration_minutes" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_exercises" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "routine_exercise_id" TEXT,
    "exercise_id" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_sets" (
    "id" TEXT NOT NULL,
    "session_exercise_id" TEXT NOT NULL,
    "set_index" INTEGER NOT NULL,
    "weight_kg" DECIMAL(6,2),
    "reps" INTEGER,
    "unit" "RepsUnit" NOT NULL DEFAULT 'REPS',
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_branch_id_idx" ON "users"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_branch_id_login_id_key" ON "users"("branch_id", "login_id");

-- CreateIndex
CREATE UNIQUE INDEX "profesores_user_id_key" ON "profesores"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_user_id_key" ON "clientes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_dni_key" ON "clientes"("dni");

-- CreateIndex
CREATE INDEX "clientes_profesor_id_idx" ON "clientes"("profesor_id");

-- CreateIndex
CREATE INDEX "clientes_routine_id_idx" ON "clientes"("routine_id");

-- CreateIndex
CREATE INDEX "exercises_branch_id_idx" ON "exercises"("branch_id");

-- CreateIndex
CREATE INDEX "exercises_category_idx" ON "exercises"("category");

-- CreateIndex
CREATE INDEX "exercises_muscle_group_idx" ON "exercises"("muscle_group");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_branch_id_catalog_id_key" ON "exercises"("branch_id", "catalog_id");

-- CreateIndex
CREATE INDEX "routines_branch_id_idx" ON "routines"("branch_id");

-- CreateIndex
CREATE INDEX "routines_profesor_id_idx" ON "routines"("profesor_id");

-- CreateIndex
CREATE UNIQUE INDEX "routine_days_routine_id_weekday_key" ON "routine_days"("routine_id", "weekday");

-- CreateIndex
CREATE INDEX "routine_exercises_routine_day_id_idx" ON "routine_exercises"("routine_day_id");

-- CreateIndex
CREATE INDEX "routine_exercises_exercise_id_idx" ON "routine_exercises"("exercise_id");

-- CreateIndex
CREATE INDEX "training_sessions_cliente_id_date_idx" ON "training_sessions"("cliente_id", "date");

-- CreateIndex
CREATE INDEX "session_exercises_session_id_idx" ON "session_exercises"("session_id");

-- CreateIndex
CREATE INDEX "session_exercises_exercise_id_idx" ON "session_exercises"("exercise_id");

-- CreateIndex
CREATE INDEX "session_sets_session_exercise_id_idx" ON "session_sets"("session_exercise_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profesores" ADD CONSTRAINT "profesores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_days" ADD CONSTRAINT "routine_days_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_routine_day_id_fkey" FOREIGN KEY ("routine_day_id") REFERENCES "routine_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_routine_day_id_fkey" FOREIGN KEY ("routine_day_id") REFERENCES "routine_days"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_routine_exercise_id_fkey" FOREIGN KEY ("routine_exercise_id") REFERENCES "routine_exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_sets" ADD CONSTRAINT "session_sets_session_exercise_id_fkey" FOREIGN KEY ("session_exercise_id") REFERENCES "session_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
