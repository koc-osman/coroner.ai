export interface ParsedProfile {
  name: string | null;
  headline: string | null;
  location: string | null;
  about: string | null;
  experience: {
    title: string;
    company: string;
    employment_type: string | null;
    start_date: string;
    end_date: string | null;
    duration: string | null;
    location: string | null;
    description: string | null;
  }[];
  education: {
    school: string;
    degree: string | null;
    field: string | null;
    dates: string | null;
  }[];
  skills: string[];
  profile_signals: {
    has_hiring_badge: boolean;
    has_open_to_work: boolean;
    number_of_roles: number;
    longest_tenure_years: number | null;
    shortest_tenure_years: number | null;
    total_experience_years: number | null;
    seniority_level: 'entry' | 'mid' | 'senior' | 'executive' | 'founder';
    geographic_spread: string[];
    headline_buzzwords: string[];
    industries: string[];
  };
}

export interface ForensicFinding {
  metric_name: string;
  score: number;
  color: 'red' | 'amber' | 'green';
}

export interface AutopsyReport {
  id: string;
  created_at: string;
  case_number: number;
  subject_name: string;
  subject_title: string;
  job_category: string;
  ai_exposure_score: {
    score: number;
    bls_base: number;
    profile_modifier: number;
    severity: 'FLATLINED' | 'CRITICAL' | 'TERMINAL' | 'LIFE SUPPORT' | 'MILD SYMPTOMS';
    severity_label: string;
  };
  career_death_date: string;
  months_remaining: number;
  cause_of_death: string;
  forensic_findings: ForensicFinding[];
  eulogy: string;
  last_words: string;
  afterlife: {
    reincarnation: {
      agent_name: string;
      agent_description: string;
      price_per_month: string;
      uptime: string;
      complaints_filed: number;
      vs_human: string;
    };
    ghost_schedule: {
      time: string;
      activity: string;
    }[];
  };
}

export interface LeaderboardEntry {
  job_title: string;
  total_autopsies: number;
  average_score: number;
}
