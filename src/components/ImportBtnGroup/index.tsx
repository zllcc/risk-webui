import { useState } from 'react';
import { Upload, Button, message, Modal, Space } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import { importPositionExecution, downloadErrorFile, downloadTradeTemplate } from '@/api/positionApi';
import { saveBlobFile } from '@/utils/file';

interface ImportTradeDataProps {
  pageType: 'asset' | 'trade' | 'traderAsset';
}

const ImportTradeData: React.FC<ImportTradeDataProps> = ({ pageType }) => {
  const [importLoading, setImportLoading] = useState(false);
  // 保存失败返回的错误文件url
  const [errorFileName, setErrorFileName] = useState('');

  // 下载模板
  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTradeTemplate({
        type: pageType === 'asset' ? '1' : '2'
      });
      saveBlobFile(blob.request.responseURL, '交易数据导入模板.xlsx');
    } catch {
      message.error('模板下载失败');
    }
  };

  // 下载错误文件
  const handleDownloadErrorFile = async () => {
    if (!errorFileName) return;
    try {
      const blob = await downloadErrorFile({
        type: pageType === 'asset' ? '1' : '2',
        fileName: errorFileName,
      });
      saveBlobFile(blob, errorFileName);
    } catch {
      message.error('错误文件下载失败');
    }
  };

  // 文件上传前处理：转base64
  const handleBeforeUpload = async (file: RcFile) => {
    setImportLoading(true);
    setErrorFileName('');
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        // 去掉base64前缀 data:xxx;base64,
        const base64Str = (reader.result as string).split(',')[1];
        console.log(reader, base64Str, '===base64Str')
        const res = await importPositionExecution({
          type: pageType === 'asset' ? '1' : '2',
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
          setErrorFileName(fileName);

          // 弹窗提示，附带下载按钮
          Modal.warning({
            title: '导入失败',
            content: '存在错误数据，请下载错误文件核对修改',
            okText: '关闭',
            footer: (_, { OkBtn }) => (
              <>
                <Button danger onClick={handleDownloadErrorFile}>下载错误文件</Button>
                <OkBtn />
              </>
            ),
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
        <Button loading={importLoading}>导入交易数据</Button>
      </Upload>
    </Space>
  );
};

export default ImportTradeData;