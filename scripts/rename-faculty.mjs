import fs from "fs";
import path from "path";

const replacements = [
  ["faculty_weekly_availability", "counselor_weekly_availability"],
  ["faculty_codes", "counselor_codes"],
  ["faculty_id", "counselor_id"],
  ["/faculty-register", "/counselor-register"],
  ["admin/faculty", "admin/counselors"],
  ["/faculty/", "/counselor/"],
  ["@/components/faculty/", "@/components/counselor/"],
  ["FacultyRegisterForm", "CounselorRegisterForm"],
  ["faculty-register-form", "counselor-register-form"],
  ["signUpFaculty", "signUpCounselor"],
  ["FacultyManagement", "CounselorManagement"],
  ["admin-faculty-view", "counselor-management-view"],
  ["faculty-management", "counselor-management"],
  ["FacultyDashboardView", "CounselorDashboardView"],
  ["faculty-dashboard-view", "counselor-dashboard-view"],
  ["FacultyAlertsView", "CounselorAlertsView"],
  ["FacultyCasesView", "CounselorCasesView"],
  ["FacultyCaseDetailView", "CounselorCaseDetailView"],
  ["FacultyPatternsView", "CounselorPatternsView"],
  ["FacultyCounselingView", "CounselorCounselingView"],
  ["FacultyMeetingView", "CounselorMeetingView"],
  ["FacultyCharts", "CounselorCharts"],
  ["faculty-charts", "counselor-charts"],
  ['t("faculty.', 't("counselor.'],
  ["t('faculty.", "t('counselor."],
  ["portal.faculty", "portal.counselor"],
  ["nav.faculty", "nav.counselor"],
  ["auth.facultyRegister", "auth.counselorRegister"],
  ["auth.facultyQuestion", "auth.counselorQuestion"],
  ["admin.faculty", "admin.counselors"],
  ["notifications.faculty", "notifications.counselor"],
  ['"faculty"', '"counselor"'],
  ["'faculty'", "'counselor'"],
  ["(faculty)", "(counselor)"],
  ["featureFaculty", "featureCounselor"],
  ["ctaFaculty", "ctaCounselor"],
  ["peopleFaculty", "peopleCounselor"],
  ["facultyReplied", "counselorReplied"],
  ["facultyResponse", "counselorResponse"],
  ["totalFaculty", "totalCounselors"],
  ["noFaculty", "noCounselors"],
  ["facultyAccounts", "counselorAccounts"],
  ["publishToFaculty", "publishToCounselors"],
  ["facultyRegistration", "counselorRegistration"],
  ["facultyAccessCode", "counselorAccessCode"],
  ["registerAsFaculty", "registerAsCounselor"],
  ["Faculty Registration", "Counselor Registration"],
  ["Faculty Portal", "Counselor Portal"],
  ["Faculty Dashboard", "Counselor Dashboard"],
  ["Faculty Management", "Counselor Management"],
  ["Faculty Accounts", "Counselor Accounts"],
  ["Faculty connected", "Counselors connected"],
  ["Faculty?", "Counselor?"],
  ["faculty member", "counselor"],
  ["faculty members", "counselors"],
  ["faculty counselors", "counselors"],
  ["Faculty ", "Counselor "],
  [" faculty", " counselor"],
  ["Faculty,", "Counselor,"],
  ["Faculty.", "Counselor."],
  ["  faculty:", "  counselor:"],
  ["  faculty: {", "  counselor: {"],
];

function walk(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (!/\.(ts|tsx|sql|md)$/.test(target)) return;
    let s = fs.readFileSync(target, "utf8");
    const orig = s;
    for (const [a, b] of replacements) s = s.split(a).join(b);
    if (s !== orig) fs.writeFileSync(target, s);
    return;
  }
  for (const ent of fs.readdirSync(target, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".next") continue;
    walk(path.join(target, ent.name));
  }
}

walk("src");
walk("supabase");
walk("docs");
if (fs.existsSync("README.md")) walk("README.md");
console.log("done");
