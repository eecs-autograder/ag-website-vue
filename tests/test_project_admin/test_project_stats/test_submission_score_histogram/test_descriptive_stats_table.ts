import DescriptiveStatsTable from '@/components/project_admin/project_stats/submission_score_histogram/descriptive_stats_table.vue';

import { managed_mount } from '@/tests/setup';

// Randomly generated
let data = [59, 99, 26, 45, 77, 27, 12, 33, 95, 14, 56, 29, 12, 35, 59, 24, 47, 96, 2, 45];
let expected_stats = {
    count: data.length.toString(),
    min: '2',
    q1: '25.50',  // default precision for the component is 2 places
    median: '40',
    q3: '59',
    max: '99',
    mean: '44.60',
    stdev: '28.43',  // Computed using Excel's STDEV.P
};

test('count', () => {
    let wrapper = managed_mount(DescriptiveStatsTable, {propsData: {values: data}});
    let rows = wrapper.findAll('tr');
    expect(rows.at(0).find('.stat-name').text()).toEqual('Count');
    expect(rows.at(0).find('.stat-value').text()).toEqual(expected_stats.count);
});

test('min', () => {
    let wrapper = managed_mount(DescriptiveStatsTable, {propsData: {values: data}});
    let rows = wrapper.findAll('tr');
    expect(rows.at(1).find('.stat-name').text()).toEqual('Min');
    expect(rows.at(1).find('.stat-value').text()).toEqual(expected_stats.min);
});

test('q1', () => {
    let wrapper = managed_mount(DescriptiveStatsTable, {propsData: {values: data}});
    let rows = wrapper.findAll('tr');
    expect(rows.at(2).find('.stat-name').text()).toEqual('Q1');
    expect(rows.at(2).find('.stat-value').text()).toEqual(expected_stats.q1);
});

test('median even number of values', () => {
    expect(data.length % 2).toEqual(0);
    let wrapper = managed_mount(DescriptiveStatsTable, {propsData: {values: data}});
    let rows = wrapper.findAll('tr');
    expect(rows.at(3).find('.stat-name').text()).toEqual('Median');
    expect(rows.at(3).find('.stat-value').text()).toEqual(expected_stats.median);
});

test('median odd number of values', () => {
    let wrapper = managed_mount(DescriptiveStatsTable, {propsData: {values: [9, 3, 7]}});
    let rows = wrapper.findAll('tr');
    expect(rows.at(3).find('.stat-name').text()).toEqual('Median');
    expect(rows.at(3).find('.stat-value').text()).toEqual('7');
});

test('q3', () => {
    let wrapper = managed_mount(DescriptiveStatsTable, {propsData: {values: data}});
    let rows = wrapper.findAll('tr');
    expect(rows.at(4).find('.stat-name').text()).toEqual('Q3');
    expect(rows.at(4).find('.stat-value').text()).toEqual(expected_stats.q3);
});

test('max', () => {
    let wrapper = managed_mount(DescriptiveStatsTable, {propsData: {values: data}});
    let rows = wrapper.findAll('tr');
    expect(rows.at(5).find('.stat-name').text()).toEqual('Max');
    expect(rows.at(5).find('.stat-value').text()).toEqual(expected_stats.max);
});

test('mean', () => {
    let wrapper = managed_mount(DescriptiveStatsTable, {propsData: {values: data}});
    let rows = wrapper.findAll('tr');
    expect(rows.at(6).find('.stat-name').text()).toEqual('Mean');
    expect(rows.at(6).find('.stat-value').text()).toEqual(expected_stats.mean);
});

test('stdev', () => {
    let wrapper = managed_mount(DescriptiveStatsTable, {propsData: {values: data}});
    let rows = wrapper.findAll('tr');
    expect(rows.at(7).find('.stat-name').text()).toEqual('Stdev');
    expect(rows.at(7).find('.stat-value').text()).toEqual(expected_stats.stdev);
});

test('Q1 and Q3 one data value', () => {
    let wrapper = managed_mount(DescriptiveStatsTable, {propsData: {values: [42]}});
    let rows = wrapper.findAll('tr');

    expect(rows.at(2).find('.stat-name').text()).toEqual('Q1');
    expect(rows.at(2).find('.stat-value').text()).toEqual('42');

    expect(rows.at(4).find('.stat-name').text()).toEqual('Q3');
    expect(rows.at(4).find('.stat-value').text()).toEqual('42');
});

test('Data values empty, only count shown', () => {
    let wrapper = managed_mount(DescriptiveStatsTable, {propsData: {values: []}});
    let rows = wrapper.findAll('tr');
    expect(rows.length).toEqual(1);
    expect(rows.at(0).find('.stat-name').text()).toEqual('Count');
    expect(rows.at(0).find('.stat-value').text()).toEqual('0');
});
