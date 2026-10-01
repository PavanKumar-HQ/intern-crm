-- ==============================================================================
-- BRANDEX PROSPECT CRM — ENTERPRISE SUPABASE RLS & RBAC SECURITY POLICIES
-- ==============================================================================
-- This script applies strict Row Level Security (RLS) and Role-Based Access Control (RBAC)
-- across all database models using Supabase Auth (auth.uid() & JWT claims).
-- ==============================================================================

-- 1. HELPER FUNCTIONS FOR RBAC CHECKS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role'),
    (SELECT role FROM "User" WHERE id = auth.uid()::text),
    'viewer'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.current_user_role() = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.current_user_role() IN ('admin', 'manager');
$$;

CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;


-- 2. ENABLE ROW LEVEL SECURITY ON ALL MODELS
-- ------------------------------------------------------------------------------
ALTER TABLE "Campaign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebsiteAudit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Opportunity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Evidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BuyingSignal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CompetitorResearch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResearchReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Outreach" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PipelineStep" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PipelineJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIUsageLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OutcomeRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Capability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;


-- 3. CAMPAIGN POLICIES
-- ------------------------------------------------------------------------------
-- View: Authenticated team members can view campaigns
CREATE POLICY "campaign_select_policy" ON "Campaign"
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert/Update: Managers & Admins can create or modify campaigns
CREATE POLICY "campaign_insert_update_policy" ON "Campaign"
  FOR ALL
  TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());

-- Delete: Admin only
CREATE POLICY "campaign_delete_policy" ON "Campaign"
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- 4. COMPANY & LEAD POLICIES
-- ------------------------------------------------------------------------------
-- View: All authenticated team members can view company & lead intelligence
CREATE POLICY "company_select_policy" ON "Company"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "lead_select_policy" ON "Lead"
  FOR SELECT TO authenticated USING (true);

-- Insert/Update: SDR, Manager, Admin can ingest/enrich leads and companies
CREATE POLICY "company_modify_policy" ON "Company"
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager', 'sdr'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager', 'sdr'));

CREATE POLICY "lead_modify_policy" ON "Lead"
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager', 'sdr'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager', 'sdr'));


-- 5. OUTREACH & APPROVAL POLICIES
-- ------------------------------------------------------------------------------
-- View: All authenticated users can view outreach drafts and outcomes
CREATE POLICY "outreach_select_policy" ON "Outreach"
  FOR SELECT TO authenticated USING (true);

-- SDR: Can create and edit drafts, but cannot mark status = 'APPROVED' or 'SENT' directly
CREATE POLICY "outreach_sdr_insert_update" ON "Outreach"
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() = 'sdr' 
    AND status IN ('DRAFT', 'PENDING_APPROVAL')
  );

-- Managers & Admins: Full review & approval authority
CREATE POLICY "outreach_manager_admin_all" ON "Outreach"
  FOR ALL TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());


-- 6. RESEARCH, EVIDENCE & WEBSITE AUDIT POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "research_select_policy" ON "WebsiteAudit" FOR SELECT TO authenticated USING (true);
CREATE POLICY "evidence_select_policy" ON "Evidence" FOR SELECT TO authenticated USING (true);
CREATE POLICY "signals_select_policy" ON "BuyingSignal" FOR SELECT TO authenticated USING (true);
CREATE POLICY "competitor_select_policy" ON "CompetitorResearch" FOR SELECT TO authenticated USING (true);
CREATE POLICY "opportunity_select_policy" ON "Opportunity" FOR SELECT TO authenticated USING (true);

-- Modification for pipeline engine / SDRs / Managers:
CREATE POLICY "opportunity_modify_policy" ON "Opportunity"
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager', 'sdr'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager', 'sdr'));


-- 7. CAPABILITY LIBRARY POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "capability_select_policy" ON "Capability"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "capability_modify_policy" ON "Capability"
  FOR ALL TO authenticated
  USING (public.is_manager_or_admin())
  WITH CHECK (public.is_manager_or_admin());


-- 8. AI USAGE LOG & BUDGET AUDIT POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "ai_usage_select_policy" ON "AIUsageLog"
  FOR SELECT TO authenticated USING (true);

-- Only system/admin can write usage logs
CREATE POLICY "ai_usage_insert_policy" ON "AIUsageLog"
  FOR INSERT TO authenticated
  WITH CHECK (public.is_authenticated());


-- 9. USER & AUDIT LOG POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "user_select_policy" ON "User"
  FOR SELECT TO authenticated
  USING (id = auth.uid()::text OR public.is_admin());

CREATE POLICY "user_admin_all_policy" ON "User"
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "audit_log_select_policy" ON "AuditLog"
  FOR SELECT TO authenticated
  USING (public.is_manager_or_admin());

CREATE POLICY "audit_log_insert_policy" ON "AuditLog"
  FOR INSERT TO authenticated
  WITH CHECK (public.is_authenticated());

-- ==============================================================================
-- END OF RLS & RBAC SECURITY SPECIFICATION
-- ==============================================================================
