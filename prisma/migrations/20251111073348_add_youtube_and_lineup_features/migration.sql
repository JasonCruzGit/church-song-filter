-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "youtube_link" TEXT;

-- CreateTable
CREATE TABLE "WorshipLineup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorshipLineup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineupSong" (
    "id" SERIAL NOT NULL,
    "lineup_id" INTEGER NOT NULL,
    "song_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineupSong_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LineupSong_lineup_id_idx" ON "LineupSong"("lineup_id");

-- CreateIndex
CREATE INDEX "LineupSong_song_id_idx" ON "LineupSong"("song_id");

-- CreateIndex
CREATE UNIQUE INDEX "LineupSong_lineup_id_song_id_key" ON "LineupSong"("lineup_id", "song_id");

-- AddForeignKey
ALTER TABLE "LineupSong" ADD CONSTRAINT "LineupSong_lineup_id_fkey" FOREIGN KEY ("lineup_id") REFERENCES "WorshipLineup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineupSong" ADD CONSTRAINT "LineupSong_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
