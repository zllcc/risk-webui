import { useState } from 'react';
import { Upload, Button, message, Modal, Space } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import { importPositionExecution, downloadErrorFile, downloadTradeTemplate } from '@/api/positionApi';
import { saveBlobFile } from '@/utils/file';

interface ImportTradeDataProps {
  type: '1' | '2' | '3';
}

const ImportTradeData: React.FC<ImportTradeDataProps> = ({ type }) => {
  const [importLoading, setImportLoading] = useState(false);

  // 下载模板
  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTradeTemplate({
        type,
      });
      saveBlobFile(blob.request.responseURL, '交易数据导入模板.xlsx');
    } catch {
      message.error('模板下载失败');
    }
  };

  // 下载错误文件
  const handleDownloadErrorFile = async (fileName: any) => {
    try {
      const blob = await downloadErrorFile({
        type,
        fileName,
      });
      saveBlobFile(blob.request.responseURL, fileName);
    } catch {
      message.error('错误文件下载失败');
    }
  };

  // 文件上传前处理：转base64
  const handleBeforeUpload = async (file: RcFile) => {
    setImportLoading(true);
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        // 去掉base64前缀 data:xxx;base64,
        const base64Str = (reader.result as string).split(',')[1];
        const res = await importPositionExecution({
          type,
          file: base64Str,
        });

        // 业务code判断
        if (res.code === 0) {
          message.success('导入成功');
        } else if (res.code === -66) {
          // 失败场景：msg 是完整接口路径 /position-history/pc/download-error-file?fileName=xxx.xlsx
          const urlStr: string = res.msg;
          // 提取fileName参数
          const url = new URL(urlStr, window.location.origin);
          const fileName = url.searchParams.get('fileName') || '';

          // 弹窗提示，附带下载按钮
          Modal.confirm({
            title: '导入失败',
            content: '存在错误数据，请下载错误文件核对修改',
            okText: '下载错误文件',
            cancelText: '取消',
            onOk: () => handleDownloadErrorFile(fileName),
            onCancel() {
              console.log('Cancel');
            },
          });
        } else {
          message.error(res.errorMsg || '导入失败');
        }
      } catch (err) {
        message.error('导入请求异常，请稍后重试');
      } finally {
        setImportLoading(false);
      }
    };

    // 阻止Upload组件自动发起http请求
    return false;
  };

  return (
    <Space>
      <Button onClick={handleDownloadTemplate}>下载导入模板</Button>
      <Upload
        beforeUpload={handleBeforeUpload}
        showUploadList={false}
        accept=".xlsx,.xls"
      >
        <Button loading={importLoading}>导入数据</Button>
      </Upload>
    </Space>
  );
};

export default ImportTradeData;