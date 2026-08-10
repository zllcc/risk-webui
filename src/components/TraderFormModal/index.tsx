import { Modal, InputNumber, AutoComplete, DatePicker, Row, Col, Button, Space } from 'antd';
import dayjs from 'dayjs';

export type ModalOperateType = 'add' | 'edit';

export interface TraderFormModalProps {
  open: boolean;
  mode: ModalOperateType;
  traderName: string;
  principal: number;
  strategyName: string;
  loan: number;
  capitalInterest: number;
  loanInterest:number;
  fee: number;
  dailyDate: string;
  traderOptions: Array<{ value: string; label: string }>;
  strategyOptions: Array<{ value: string; label: string }>;
  onCancel: () => void;
  onConfirm: (trader: string, principal: number, strategy: string, loan: number, interest: number, fee: number, dailyDate: string) => void;
  onChangeTrader: (val: string) => void;
  onChangePrincipal: (val: number | null) => void;
  onChangeStrategy: (val: string) => void;
  onChangeLoan: (val: number | null) => void;
  onChangeInterest: (val: number | null) => void;
  onChangeFee: (val: number | null) => void;
  onChangeDate: (val: string) => void;
}

const TraderFormModal: React.FC<TraderFormModalProps> = ({
  open,
  mode,
  traderName,
  principal,
  strategyName,
  loan,
  capitalInterest,
  loanInterest,
  fee,
  dailyDate,
  traderOptions,
  strategyOptions,
  onCancel,
  onConfirm,
  onChangeTrader,
  onChangePrincipal,
  onChangeStrategy,
  onChangeLoan,
  onChangeInterest,
  onChangeFee,
  onChangeDate,
}) => {
  const filterOption = (inputValue: string, option?: { value: string; label: string }) =>
    (option?.label ?? '').toString().toLowerCase().includes(inputValue.toLowerCase());

  return (
    <Modal
      title={mode === 'edit' ? '编辑交易员' : '新增交易员'}
      open={open}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={() => onConfirm(traderName, principal, strategyName, loan, capitalInterest, loanInterest , fee, dailyDate)}>确认</Button>
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
                disabled={mode === 'edit'}
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
              <label>策略：</label>
            </Col>
            <Col span={20}>
              <AutoComplete
                value={strategyName || undefined}
                options={strategyOptions}
                onChange={onChangeStrategy}
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
                min={0}
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
                onChange={onChangeInterest}
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
                onChange={onChangeInterest}
                placeholder="填写贷款利息金额"
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row align="middle" style={{ width: '100%' }}>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 12 }}>
              <label>费用：</label>
            </Col>
            <Col span={20}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                value={fee}
                onChange={onChangeFee}
                placeholder="填写费用金额"
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
};

export default TraderFormModal;
