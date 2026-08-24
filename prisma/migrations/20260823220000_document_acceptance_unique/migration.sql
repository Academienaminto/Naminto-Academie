-- Un membre ne doit avoir qu'une seule ligne d'acceptation par version de
-- document (RÈGLES MÉTIER §63-64, documents réglementaires) : accepter à
-- nouveau la même version met à jour la date plutôt que de dupliquer.
CREATE UNIQUE INDEX "document_acceptances_document_version_id_user_id_key" ON "document_acceptances"("document_version_id", "user_id");
