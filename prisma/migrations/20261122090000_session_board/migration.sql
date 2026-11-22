-- CreateTable
CREATE TABLE "SessionBoard" (
    "sessionId" UUID NOT NULL,
    "doc" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionBoard_pkey" PRIMARY KEY ("sessionId")
);

-- AddForeignKey
ALTER TABLE "SessionBoard" ADD CONSTRAINT "SessionBoard_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Realtime authorization for the board channels. Boards use private channels
-- named "board:<sessionId>"; Realtime checks these policies on join, so only
-- that session's tutor and student can send or receive strokes. The helper is
-- SECURITY DEFINER because the authenticated role has no grant on "Session".
-- Guarded: the realtime schema only exists on Supabase, not on a bare Postgres.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'realtime' AND table_name = 'messages'
  ) THEN
    CREATE OR REPLACE FUNCTION public.is_session_board_member(topic text)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $fn$
      SELECT EXISTS (
        SELECT 1 FROM "Session" s
        WHERE 'board:' || s.id::text = topic
          AND (s."tutorId" = auth.uid() OR s."studentId" = auth.uid())
      );
    $fn$;
    REVOKE ALL ON FUNCTION public.is_session_board_member(text) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.is_session_board_member(text) TO authenticated;

    DROP POLICY IF EXISTS "session board members receive" ON realtime.messages;
    CREATE POLICY "session board members receive" ON realtime.messages
      FOR SELECT TO authenticated
      USING (
        realtime.messages.extension IN ('broadcast', 'presence')
        AND public.is_session_board_member(realtime.topic())
      );

    DROP POLICY IF EXISTS "session board members send" ON realtime.messages;
    CREATE POLICY "session board members send" ON realtime.messages
      FOR INSERT TO authenticated
      WITH CHECK (
        realtime.messages.extension IN ('broadcast', 'presence')
        AND public.is_session_board_member(realtime.topic())
      );
  END IF;
END $$;
