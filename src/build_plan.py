"""Build the Excel workbook with the 7th-grade home-school plan.

Reads plan_data, validates that every week and month is covered, and writes
one workbook with six sheets: overview, monthly plan, weekly plan, subject
hours, assessment points and the school calendar.
"""

from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.page import PageMargins

import plan_data as data

OUTPUT_PATH = Path(__file__).resolve().parents[1] / "План_7_класс_2026-2027.xlsx"

DARK_BLUE = "1F3864"
MID_BLUE = "2F5597"
LIGHT_BLUE = "DEEAF6"
BAND_ONE = "F2F6FC"
BAND_TWO = "FFFFFF"
VACATION_FILL = "FCE4D6"
ACCENT_RED = "C00000"
GREY_TEXT = "595959"

THIN = Side(style="thin", color="BFBFBF")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)

WEEKLY_SCHEDULE = [
    ("Понедельник", ["Русский язык", "Алгебра", "История", "Иностранный язык", "Биология"]),
    ("Вторник", ["Литература", "Геометрия", "Физика", "Русский язык"]),
    ("Среда", ["Алгебра", "Русский язык", "География", "Обществознание", "Иностранный язык"]),
    ("Четверг", ["Литература", "Геометрия", "Физика", "История"]),
    ("Пятница", ["Русский язык", "Алгебра", "География", "Иностранный язык",
                 "Вероятность и статистика"]),
]


def estimate_row_height(texts, column_width, font_size=9, minimum=24, maximum=170):
    """Guess a row height that shows wrapped text without clipping.

    Excel cannot auto-fit rows with wrapped text, so we approximate: one
    character of Calibri at 9 pt takes about 0.85 width units.
    """
    characters_per_line = max(8, int(column_width * 1.25))
    lines = 1
    for text in texts:
        if not text:
            continue
        text_lines = sum(max(1, -(-len(part) // characters_per_line))
                         for part in str(text).split("\n"))
        lines = max(lines, text_lines)
    line_height = font_size + 2.5
    return min(maximum, max(minimum, lines * line_height + 6))


def style_header(cell, fill=DARK_BLUE, size=11):
    """Paint one header cell with the shared dark style."""
    cell.font = Font(bold=True, color="FFFFFF", size=size, name="Calibri")
    cell.fill = PatternFill("solid", fgColor=fill)
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell.border = BORDER


def style_body(cell, size=10, bold=False, align="left"):
    """Paint one ordinary table cell."""
    cell.font = Font(size=size, bold=bold, name="Calibri")
    cell.alignment = Alignment(horizontal=align, vertical="top", wrap_text=True)
    cell.border = BORDER


def set_page(worksheet, orientation="landscape"):
    """Apply print settings that keep wide tables on one page width."""
    worksheet.page_setup.orientation = orientation
    worksheet.page_setup.fitToWidth = 1
    worksheet.page_setup.fitToHeight = 0
    worksheet.sheet_properties.pageSetUpPr.fitToPage = True
    worksheet.page_margins = PageMargins(left=0.3, right=0.3, top=0.4, bottom=0.4)


def validate():
    """Stop early if the data has gaps, so the workbook never ships broken."""
    week_numbers = [week["number"] for week in data.WEEKS]
    assert week_numbers == list(range(1, 37)), "weeks must be numbered 1..36"

    for subject in data.SUBJECTS:
        missing = set(range(1, 37)) - set(subject["topics"])
        extra = set(subject["topics"]) - set(range(1, 37))
        assert not missing and not extra, f"{subject['name']}: weeks {missing or extra}"
        assert set(subject["monthly"]) == set(data.MONTHS), subject["name"]
        assert subject["weekly_hours"] * 34 >= subject["annual"] * 0.9, subject["name"]

    total_weekly = sum(subject["weekly_hours"] for subject in data.SUBJECTS)
    assert total_weekly == data.SCHOOL_YEAR["weekly_hours"], total_weekly


def build_overview(worksheet):
    """First sheet: year facts, weekly schedule and working rules."""
    worksheet.sheet_properties.tabColor = "1F3864"
    worksheet.sheet_view.showGridLines = False
    widths = [26, 30, 26, 26, 22, 22]
    for index, width in enumerate(widths, start=1):
        worksheet.column_dimensions[get_column_letter(index)].width = width

    worksheet.merge_cells("A1:F1")
    title = worksheet["A1"]
    title.value = data.SCHOOL_YEAR["title"]
    title.font = Font(size=18, bold=True, color=DARK_BLUE, name="Calibri")
    title.alignment = Alignment(vertical="center")
    worksheet.row_dimensions[1].height = 34

    worksheet.merge_cells("A2:F2")
    subtitle = worksheet["A2"]
    subtitle.value = ("Семейное образование. План составлен по федеральным рабочим программам "
                      "для 7 класса, пятидневная неделя, основные предметы.")
    subtitle.font = Font(size=10, italic=True, color=GREY_TEXT, name="Calibri")
    subtitle.alignment = Alignment(vertical="center", wrap_text=True)
    worksheet.row_dimensions[2].height = 30

    facts = [
        ("Учебный год", f"{data.SCHOOL_YEAR['start']} — {data.SCHOOL_YEAR['end']}"),
        ("Учебных недель", "36 календарных недель, 34 полные; 173 учебных дня"),
        ("Нагрузка", f"{data.SCHOOL_YEAR['weekly_hours']} урока в неделю, около 4–5 в день"),
        ("Всего часов", "782 часа за год по основным предметам"),
        ("Каникулы", "26.10–03.11.2026, 31.12.2026–10.01.2027, 27.03–04.04.2027"),
    ]

    row = 4
    worksheet.cell(row=row, column=1, value="Главное о годе").font = Font(
        size=13, bold=True, color=DARK_BLUE, name="Calibri")
    row += 1
    for name, value in facts:
        left = worksheet.cell(row=row, column=1, value=name)
        right = worksheet.cell(row=row, column=2, value=value)
        worksheet.merge_cells(start_row=row, start_column=2, end_row=row, end_column=6)
        style_body(left, bold=True)
        style_body(right)
        worksheet.row_dimensions[row].height = 26
        row += 1

    row += 1
    worksheet.cell(row=row, column=1, value="Учебная неделя: рекомендация").font = Font(
        size=13, bold=True, color=DARK_BLUE, name="Calibri")
    row += 1
    for column, header in enumerate(["День", "1-й урок", "2-й урок", "3-й урок", "4-й урок",
                                     "5-й урок"], start=1):
        style_header(worksheet.cell(row=row, column=column, value=header), MID_BLUE, 10)
    row += 1
    for day, lessons in WEEKLY_SCHEDULE:
        cells = [day] + lessons + [""] * (5 - len(lessons))
        for column, value in enumerate(cells, start=1):
            cell = worksheet.cell(row=row, column=column, value=value)
            style_body(cell, bold=(column == 1))
        worksheet.row_dimensions[row].height = 30
        row += 1

    worksheet.merge_cells(start_row=row, start_column=1, end_row=row, end_column=6)
    note = worksheet.cell(row=row, column=1)
    note.value = ("Один урок — 30–40 минут для дома, между уроками перерыв 10–15 минут. "
                  "Порядок уроков внутри дня можно менять: главное — сохранить число уроков "
                  "по предмету за неделю.")
    note.font = Font(size=9, italic=True, color=GREY_TEXT, name="Calibri")
    note.alignment = Alignment(wrap_text=True, vertical="top")
    worksheet.row_dimensions[row].height = 30

    row += 2
    worksheet.cell(row=row, column=1, value="Как работать с планом").font = Font(
        size=13, bold=True, color=DARK_BLUE, name="Calibri")
    row += 1
    rules = [
        ("Лист «По неделям»", "основной рабочий лист: на каждой неделе указаны темы всех предметов."),
        ("Лист «По месяцам»", "обзор: что должно быть освоено за месяц по каждому предмету."),
        ("Лист «Контрольные»", "даты проверочных и итоговых работ; их можно сдвигать на 1–2 недели."),
        ("Лист «Часы»", "сколько уроков в неделю и что проверяется в конце года."),
        ("Лист «Календарь»", "учебные недели и каникулы 2026/2027."),
        ("Если отстаём", "не догоняйте всё сразу: сдвиньте темы на неделю, но сохраните контрольные точки."),
        ("Раз в месяц", "сверяйтесь с листом «По месяцам» и отмечайте пройденное."),
    ]
    for name, text in rules:
        left = worksheet.cell(row=row, column=1, value=name)
        right = worksheet.cell(row=row, column=2, value=text)
        worksheet.merge_cells(start_row=row, start_column=2, end_row=row, end_column=6)
        style_body(left, bold=True)
        style_body(right)
        worksheet.row_dimensions[row].height = 26
        row += 1

    row += 1
    worksheet.cell(row=row, column=1, value="Чем пользоваться").font = Font(
        size=13, bold=True, color=DARK_BLUE, name="Calibri")
    row += 1
    resources = [
        ("Российская электронная школа", "resh.edu.ru — видеоуроки и задания по всем предметам 7 класса"),
        ("Библиотека ЦОК", "m.edsoo.ru — цифровые материалы к каждой теме федеральной программы"),
        ("ФИПИ", "fipi.ru — демоверсии и требования к результатам, полезно для проверки уровня"),
        ("Тренажёры", "uchi.ru, yaklass.ru — отработка правил и задач"),
        ("Тексты для литературы", "полка.рф, nlr.ru — полные тексты произведений"),
    ]
    for name, text in resources:
        left = worksheet.cell(row=row, column=1, value=name)
        right = worksheet.cell(row=row, column=2, value=text)
        worksheet.merge_cells(start_row=row, start_column=2, end_row=row, end_column=6)
        style_body(left, bold=True)
        style_body(right)
        worksheet.row_dimensions[row].height = 26
        row += 1

    set_page(worksheet, "portrait")


def build_calendar(worksheet):
    """School calendar with weeks, vacations and short-week notes."""
    worksheet.sheet_properties.tabColor = "2F5597"
    widths = [10, 16, 14, 12, 60]
    for index, width in enumerate(widths, start=1):
        worksheet.column_dimensions[get_column_letter(index)].width = width

    worksheet.merge_cells("A1:E1")
    worksheet["A1"].value = "Календарь 2026/2027: учебные недели и каникулы"
    worksheet["A1"].font = Font(size=14, bold=True, color=DARK_BLUE, name="Calibri")
    worksheet.row_dimensions[1].height = 28

    headers = ["Неделя", "Даты", "Месяц", "Учебных дней", "Событие"]
    for column, header in enumerate(headers, start=1):
        style_header(worksheet.cell(row=2, column=column, value=header), MID_BLUE, 10)

    row = 3
    for week in data.WEEKS:
        values = [week["number"], week["dates"], week["month"], week["days"], week["note"]]
        for column, value in enumerate(values, start=1):
            cell = worksheet.cell(row=row, column=column, value=value)
            style_body(cell, align="center" if column in (1, 3, 4) else "left")
            if week["days"] < 5:
                cell.fill = PatternFill("solid", fgColor=LIGHT_BLUE)
        worksheet.row_dimensions[row].height = 22
        row += 1

    row += 1
    worksheet.cell(row=row, column=1, value="Каникулы").font = Font(
        size=12, bold=True, color=DARK_BLUE, name="Calibri")
    row += 1
    for name, dates, length in data.VACATIONS:
        left = worksheet.cell(row=row, column=1, value=name)
        right = worksheet.cell(row=row, column=2, value=dates)
        worksheet.merge_cells(start_row=row, start_column=2, end_row=row, end_column=4)
        last = worksheet.cell(row=row, column=5, value=length)
        style_body(left, bold=True)
        style_body(right)
        style_body(last, align="center")
        for column in range(1, 6):
            worksheet.cell(row=row, column=column).fill = PatternFill("solid", fgColor=VACATION_FILL)
        row += 1

    worksheet.freeze_panes = "A3"
    worksheet.print_title_rows = "1:2"
    set_page(worksheet, "portrait")


def build_monthly(worksheet):
    """Subject rows against month columns: the one-page year overview."""
    worksheet.sheet_properties.tabColor = "548235"
    worksheet.column_dimensions["A"].width = 20
    for index in range(2, 11):
        worksheet.column_dimensions[get_column_letter(index)].width = 26

    worksheet.merge_cells("A1:J1")
    worksheet["A1"].value = "План по месяцам: что осваиваем"
    worksheet["A1"].font = Font(size=14, bold=True, color=DARK_BLUE, name="Calibri")
    worksheet.row_dimensions[1].height = 28

    worksheet.cell(row=2, column=1, value="Предмет")
    style_header(worksheet.cell(row=2, column=1, value="Предмет"), MID_BLUE, 10)
    for column, month in enumerate(data.MONTHS, start=2):
        style_header(worksheet.cell(row=2, column=column, value=month), MID_BLUE, 10)

    row = 3
    for subject in data.SUBJECTS:
        style_body(worksheet.cell(row=row, column=1, value=subject["name"]), bold=True)
        worksheet.cell(row=row, column=1).fill = PatternFill("solid", fgColor=LIGHT_BLUE)
        for column, month in enumerate(data.MONTHS, start=2):
            cell = worksheet.cell(row=row, column=column, value=subject["monthly"][month])
            style_body(cell, size=9)
        worksheet.row_dimensions[row].height = estimate_row_height(
            list(subject["monthly"].values()), 26, font_size=9, minimum=40)
        row += 1

    style_body(worksheet.cell(row=row, column=1, value="Контрольные и зачёты"), bold=True)
    worksheet.cell(row=row, column=1).fill = PatternFill("solid", fgColor="FFF2CC")
    control_texts = []
    for column, month in enumerate(data.MONTHS, start=2):
        weeks_in_month = [week["number"] for week in data.WEEKS if week["month"] == month]
        subjects = []
        for week_number in weeks_in_month:
            for subject_name, _ in data.CONTROLS.get(week_number, []):
                if subject_name not in subjects:
                    subjects.append(subject_name)
        text = "• " + "\n• ".join(subjects) if subjects else "—"
        control_texts.append(text)
        cell = worksheet.cell(row=row, column=column, value=text)
        style_body(cell, size=9)
        cell.fill = PatternFill("solid", fgColor="FFF2CC")
    worksheet.row_dimensions[row].height = estimate_row_height(
        control_texts, 26, font_size=9, minimum=40)

    worksheet.freeze_panes = "B3"
    worksheet.print_title_rows = "1:2"
    set_page(worksheet, "landscape")


def build_weekly(worksheet):
    """Week rows against subject columns: the working plan for every week."""
    worksheet.sheet_properties.tabColor = "BF8F00"
    headers = ["Неделя", "Даты", "Месяц"] + [subject["name"] for subject in data.SUBJECTS] + \
              ["Контрольные"]
    widths = [8, 13, 11] + [28] * len(data.SUBJECTS) + [24]
    for index, width in enumerate(widths, start=1):
        worksheet.column_dimensions[get_column_letter(index)].width = width

    worksheet.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(headers))
    worksheet.cell(row=1, column=1, value="План по неделям: темы уроков").font = Font(
        size=14, bold=True, color=DARK_BLUE, name="Calibri")
    worksheet.row_dimensions[1].height = 28

    for column, header in enumerate(headers, start=1):
        style_header(worksheet.cell(row=2, column=column, value=header), MID_BLUE, 10)
    worksheet.row_dimensions[2].height = 42

    row = 3
    for week in data.WEEKS:
        month_index = data.MONTHS.index(week["month"])
        band = BAND_ONE if month_index % 2 == 0 else BAND_TWO
        values = [week["number"], week["dates"], week["month"]]
        values += [subject["topics"][week["number"]] for subject in data.SUBJECTS]
        control_text = " • ".join(name for name, _ in data.CONTROLS.get(week["number"], []))
        values.append(control_text or "—")

        for column, value in enumerate(values, start=1):
            cell = worksheet.cell(row=row, column=column, value=value)
            style_body(cell, size=9, align="center" if column <= 3 else "left")
            cell.fill = PatternFill("solid", fgColor=band)
            if column == len(headers) and control_text:
                cell.fill = PatternFill("solid", fgColor="FFF2CC")
                cell.font = Font(size=9, bold=True, name="Calibri")
        worksheet.row_dimensions[row].height = estimate_row_height(
            values[3:], 28, font_size=9, minimum=34)
        row += 1

    worksheet.freeze_panes = "D3"
    worksheet.print_title_rows = "2:2"
    set_page(worksheet, "landscape")


def build_hours(worksheet):
    """Subject hours and year results."""
    worksheet.sheet_properties.tabColor = "7030A0"
    widths = [24, 10, 10, 52, 40]
    for index, width in enumerate(widths, start=1):
        worksheet.column_dimensions[get_column_letter(index)].width = width

    worksheet.merge_cells("A1:E1")
    worksheet["A1"].value = "Предметы, часы и результаты года"
    worksheet["A1"].font = Font(size=14, bold=True, color=DARK_BLUE, name="Calibri")
    worksheet.row_dimensions[1].height = 28

    headers = ["Предмет", "Уроков в неделю", "Часов в год", "Основное содержание",
               "Что проверяем в конце года"]
    for column, header in enumerate(headers, start=1):
        style_header(worksheet.cell(row=2, column=column, value=header), MID_BLUE, 10)

    row = 3
    for subject in data.SUBJECTS:
        values = [subject["name"], subject["weekly_hours"], subject["annual"],
                  subject["focus"], subject["year_result"]]
        for column, value in enumerate(values, start=1):
            cell = worksheet.cell(row=row, column=column, value=value)
            style_body(cell, size=9, align="center" if column in (2, 3) else "left",
                       bold=(column == 1))
        worksheet.row_dimensions[row].height = 54
        row += 1

    total_weekly = sum(subject["weekly_hours"] for subject in data.SUBJECTS)
    total_annual = sum(subject["annual"] for subject in data.SUBJECTS)
    values = ["Итого", total_weekly, total_annual, "Основные предметы без ИЗО, музыки, технологии и физкультуры", ""]
    for column, value in enumerate(values, start=1):
        cell = worksheet.cell(row=row, column=column, value=value)
        style_body(cell, size=10, align="center" if column in (2, 3) else "left", bold=True)
        cell.fill = PatternFill("solid", fgColor=LIGHT_BLUE)

    worksheet.freeze_panes = "A3"
    set_page(worksheet, "landscape")


def build_controls(worksheet):
    """All assessment points in date order."""
    worksheet.sheet_properties.tabColor = ACCENT_RED
    widths = [10, 16, 26, 62]
    for index, width in enumerate(widths, start=1):
        worksheet.column_dimensions[get_column_letter(index)].width = width

    worksheet.merge_cells("A1:D1")
    worksheet["A1"].value = "Контрольные точки года"
    worksheet["A1"].font = Font(size=14, bold=True, color=DARK_BLUE, name="Calibri")
    worksheet.row_dimensions[1].height = 28

    headers = ["Неделя", "Даты", "Предмет", "Что проверяет"]
    for column, header in enumerate(headers, start=1):
        style_header(worksheet.cell(row=2, column=column, value=header), MID_BLUE, 10)

    weeks_by_number = {week["number"]: week for week in data.WEEKS}
    row = 3
    for week_number in sorted(data.CONTROLS):
        week = weeks_by_number[week_number]
        for subject_name, form in data.CONTROLS[week_number]:
            values = [week_number, week["dates"], subject_name, form]
            for column, value in enumerate(values, start=1):
                cell = worksheet.cell(row=row, column=column, value=value)
                style_body(cell, size=9, align="center" if column == 1 else "left",
                           bold=(column == 3))
            worksheet.row_dimensions[row].height = 30
            row += 1

    worksheet.freeze_panes = "A3"
    worksheet.print_title_rows = "1:2"
    set_page(worksheet, "portrait")


def build_workbook():
    """Create every sheet and save the workbook next to this script's parent."""
    validate()
    workbook = Workbook()
    workbook.remove(workbook.active)

    build_overview(workbook.create_sheet("Как пользоваться"))
    build_monthly(workbook.create_sheet("По месяцам"))
    build_weekly(workbook.create_sheet("По неделям"))
    build_hours(workbook.create_sheet("Предметы и часы"))
    build_controls(workbook.create_sheet("Контрольные"))
    build_calendar(workbook.create_sheet("Календарь"))

    workbook.active = 0
    workbook.save(OUTPUT_PATH)
    print(f"saved: {OUTPUT_PATH}")


if __name__ == "__main__":
    build_workbook()
