import numpy as np

def simulate_wealth(age, salary, savings, expenses, children):

    years = 67 - age
    results = []

    inflation = 0.02
    salary_growth = 0.025

    crash_prob = 0.05
    crash_size = -0.25

    child_cost = 3500

    for _ in range(10000):

        wealth = savings
        current_salary = salary

        for _ in range(years):

            # salario
            current_salary *= np.random.normal(1 + salary_growth, 0.01)

            # spese
            total_expenses = expenses * 12 * (1 + inflation)
            total_expenses += children * child_cost

            saving = max(current_salary * 12 - total_expenses, 0)

            # shock di mercato
            if np.random.rand() < crash_prob:
                market_return = crash_size
            else:
                market_return = np.random.normal(0.07, 0.15)

            wealth += saving
            wealth *= (1 + market_return)

        results.append(wealth)

    return results
