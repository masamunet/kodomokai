export const GRADES = [
  { label: '未就学児', minAge: 0, maxAge: 6 }, // 簡易的な定義。実際は生年月日で判定するが、表示用
  { label: '小学1年生', age: 6 },
  { label: '小学2年生', age: 7 },
  { label: '小学3年生', age: 8 },
  { label: '小学4年生', age: 9 },
  { label: '小学5年生', age: 10 },
  { label: '小学6年生', age: 11 },
  { label: '中学1年生', age: 12 },
  { label: '中学2年生', age: 13 },
  { label: '中学3年生', age: 14 },
  { label: '高校1年生', age: 15 },
  { label: '高校2年生', age: 16 },
  { label: '高校3年生', age: 17 },
] as const;

/**
 * 対象年度の4月1日時点での年齢を計算する
 * @param birthday 生年月日 (YYYY-MM-DD or Date object)
 * @param targetFiscalYear 対象年度 (e.g. 2025)
 * @returns 年齢
 */
export function calculateAge(birthday: string | Date, targetFiscalYear: number): number {
  const birthDate = typeof birthday === 'string' ? new Date(birthday) : birthday;
  const targetDate = new Date(targetFiscalYear, 3, 1); // 4月1日

  let age = targetDate.getFullYear() - birthDate.getFullYear();
  const m = targetDate.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && targetDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * 生年月日から学年を計算する
 * 日本の学校制度: 4月2日生まれ〜翌年4月1日生まれが同一学年
 * @param birthday 生年月日
 * @param targetFiscalYear 対象年度
 */
export function calculateGrade(birthday: string | Date, targetFiscalYear: number): string {
  const birthDate = typeof birthday === 'string' ? new Date(birthday) : birthday;

  // 学年の基準となる年度を計算
  // 4月1日生まれはその前の年度の学年になるため、
  // 生まれた年が基準ではなく、4月2日〜翌4月1日の範囲で考える。

  // 単純な年齢ベースのアプローチではなく、厳密な学年計算を行う
  // 小学1年生になる年度: 満6歳になる年度の翌年度の4月
  // -> 4/2生まれ〜翌4/1生まれが、その年度に満6歳〜7歳になる。
  // まり、対象年度の4月1日時点で満6歳である子供は、早生まれ(1/1-4/1)を除いて新小学1年生。
  // 早生まれ(1/1-4/1)の場合は、6歳になっていても前の学年...いや、これはややこしい。

  // 一般的な計算式:
  // 学年 = 対象年度 - (生まれた年度) - x
  // ただし、早生まれ(1/1〜4/1)は「生まれた年度 - 1」として扱うのが通例。

  const birthYear = birthDate.getFullYear();
  const birthMonth = birthDate.getMonth() + 1;
  const birthDay = birthDate.getDate();

  // 学校教育法上の「生まれた年度」（早生まれは前年度扱い）
  let schoolYearOfBirth = birthYear;
  if (birthMonth === 1 || birthMonth === 2 || birthMonth === 3 || (birthMonth === 4 && birthDay === 1)) {
    schoolYearOfBirth = birthYear - 1;
  }

  // 学年インデックス: 対象年度 - (教育上の生まれた年度)
  // 例: 2025年度
  // 2018年度生まれ (2018/4/2 - 2019/4/1) -> 2025 - 2018 = 7 -> 小学1年生
  // 2019年度生まれ (2019/4/2 - 2020/4/1) -> 2025 - 2019 = 6 -> 年長 (未就学)

  // 基準:
  // 小学1年生: 対象年度 - 生まれた年度 = 7
  // 中学1年生: 対象年度 - 生まれた年度 = 13
  // 高校1年生: 対象年度 - 生まれた年度 = 16

  const diff = targetFiscalYear - schoolYearOfBirth;

  if (diff < 7) {
    return '未就学児';
  } else if (diff === 7) {
    return '小学1年生';
  } else if (diff === 8) {
    return '小学2年生';
  } else if (diff === 9) {
    return '小学3年生';
  } else if (diff === 10) {
    return '小学4年生';
  } else if (diff === 11) {
    return '小学5年生';
  } else if (diff === 12) {
    return '小学6年生';
  } else if (diff === 13) {
    return '中学1年生';
  } else if (diff === 14) {
    return '中学2年生';
  } else if (diff === 15) {
    return '中学3年生';
  } else if (diff === 16) {
    return '高校1年生';
  } else if (diff === 17) {
    return '高校2年生';
  } else if (diff === 18) {
    return '高校3年生';
  } else {
    return '高校卒業済'; // または単に '大人'
  }
}

/**
 * 学年順にソートするための並び順値を取得
 * @param gradeStr 学年文字列
 */
export function getGradeOrder(gradeStr: string): number {
  switch (gradeStr) {
    case '未就学児': return 0;
    case '小学1年生': return 1;
    case '小学2年生': return 2;
    case '小学3年生': return 3;
    case '小学4年生': return 4;
    case '小学5年生': return 5;
    case '小学6年生': return 6;
    case '中学1年生': return 7;
    case '中学2年生': return 8;
    case '中学3年生': return 9;
    case '高校1年生': return 10;
    case '高校2年生': return 11;
    case '高校3年生': return 12;
    default: return 99;
  }
}
