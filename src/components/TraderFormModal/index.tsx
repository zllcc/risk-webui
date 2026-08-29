import { Modal, InputNumber, AutoComplete, DatePicker, Row, Col, Button, Space } from 'antd';
import dayjs from 'dayjs';

export type ModalOperateType = 'add' | 'edit';

export interface TraderFormModalProps {
  open: boolean;
  mode: ModalOperateType;
  traderName: string;
  accountCode: string;
  principal: number;
  strategyName: string;
  loan: number;
  capitalInterest: number;
  loanInterest: number;
  fee: number;
  income: number;
  dailyDate: string;
  traderOptions: Array<{ value: string; label: string }>;
  accountOptions: Array<{ value: string; label: string }>;
  strategyOptions: Array<{ value: string; label: string }>;
  onCancel: () => void;
  onConfirm: (trader: string, accountCode: string, principal: number, strategy: string, loan: number, capitalInterest: number, loanInterest: number, fee: number, income: number, dailyDate: string) => void;
  onChangeTrader: (val: string) => void;
  onChangeAccount: (val: string) => void;
  onChangePrincipal: (val: number | null) => void;
  onChangeStrategy: (val: string) => void;
  onChangeLoan: (val: number | null) => void;
  onChangeCapitalInterest: (val: number | null) => void;
  onChangeLoanInterest: (val: number | null) => void;
  onChangeFee: (val: number | null) => void;
  onChangeIncome: (val: number | null) => void;
  onChangeDate: (val: string) => void;
}

const TraderFormModal: React.FC<TraderFormModalProps> = ({
  open,
  mode,
  traderName,
  accountCode,
  principal,
  strategyName,
  loan,
  capitalInterest,
  loanInterest,
  fee,
  income,
  dailyDate,
  traderOptions,
  accountOptions,
  strategyOptions,
  onCancel,
  onConfirm,
  onChangeTrader,
  onChangeAccount,
  onChangePrincipal,
  onChangeStrategy,
  onChangeLoan,
  onChangeCapitalInterest,
  onChangeLoanInterest,
  onChangeFee,
  onChangeIncome,
  onChangeDate,
}) => {
  const filterOption = (inputValue: string, option?: { value: string; label: string }) =>
    (option?.label ?? '').toString().toLowerCase().includes(inputValue.toLowerCase());

  // 编辑模式下，交易员/策略/账号不可修改
  const isEdit = mode === 'edit';

  return (
    <Modal
      title={isEdit ? '编辑交易员' : '新增交易员'}
      open={open}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={() => onConfirm(traderName, accountCode, principal, strategyName, loan, capitalInterest, loanInterest, fee, income, dailyDate)}>确认</Button>
        </Space>
      }
    >
      {/* 单列布局，严格上下对齐 */}
      <Row gutter={[0, 16]} style={{ width: '100%' }}>
        <Col span={24}>
          <Row align="middle" style={{ width: '100%' }}>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 12 }}>
              <label>日期：</label>
            </Col>
            <Col span={20}>
              <DatePicker
                value={dailyDate ? dayjs(dailyDate) : null}
                onChange={(_, dateStr) => onChangeDate(dateStr as string)}
                disabled={isEdit}
                placeholder="请选择日期"
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row align="middle" style={{ width: '100%' }}>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 12 }}>
              <label>交易员：</label>
            </Col>
            <Col span={20}>
              <AutoComplete
                value={traderName}
                options={traderOptions}
                onChange={onChangeTrader}
                disabled={isEdit}
                placeholder="填写或选择交易员"
                style={{ width: '100%' }}
                filterOption={filterOption}
                allowClear
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row align="middle" style={{ width: '100%' }}>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 12 }}>
              <label>账号：</label>
            </Col>
            <Col span={20}>
              <AutoComplete
                value={accountCode || undefined}
                options={accountOptions}
                onChange={onChangeAccount}
                disabled={isEdit}
                placeholder="填写或选择账号"
                style={{ width: '100%' }}
                filterOption={filterOption}
                allowClear
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row align="middle" style={{ width: '100%' }}>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 12 }}>
              <label>策略：</label>
            </Col>
            <Col span={20}>
              <AutoComplete
                value={strategyName || undefined}
                options={strategyOptions}
                onChange={onChangeStrategy}
                disabled={isEdit}
                placeholder="填写或选择策略"
                style={{ width: '100%' }}
                filterOption={filterOption}
                allowClear
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row align="middle" style={{ width: '100%' }}>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 12 }}>
              <label>本金：</label>
            </Col>
            <Col span={20}>
              <InputNumber
                style={{ width: '100%' }}
                
                value={principal}
                onChange={onChangePrincipal}
                placeholder="填写本金数值"
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row align="middle" style={{ width: '100%' }}>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 12 }}>
              <label>本金利息：</label>
            </Col>
            <Col span={20}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                value={capitalInterest}
                onChange={onChangeCapitalInterest}
                placeholder="填写本金利息金额"
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row align="middle" style={{ width: '100%' }}>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 12 }}>
              <label>贷款：</label>
            </Col>
            <Col span={20}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                value={loan}
                onChange={onChangeLoan}
                placeholder="填写贷款金额"
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row align="middle" style={{ width: '100%' }}>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 12 }}>
              <label>贷款利息：</label>
            </Col>
            <Col span={20}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                value={loanInterest}
                onChange={onChangeLoanInterest}
                placeholder="填写贷款利息金额"
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row align="middle" style={{ width: '100%' }}>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 12 }}>
              <label>收入：</label>
            </Col>
            <Col span={20}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                value={income}
                onChange={onChangeIncome}
                placeholder="填写收入金额"
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row align="middle" style={{ width: '100%' }}>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 12 }}>
              <label>支出：</label>
            </Col>
            <Col span={20}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                value={fee}
                onChange={onChangeFee}
                placeholder="填写支出金额"
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
};

export default TraderFormModal;
